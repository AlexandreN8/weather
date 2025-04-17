import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (classification_report, 
                             confusion_matrix, mean_absolute_error)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from keras.models import Sequential
from keras.layers import LSTM, Dense, Input
from tensorflow.keras.callbacks import EarlyStopping
import pickle
import tensorflow as tf
from sklearn.base import BaseEstimator, TransformerMixin

class TimeSeriesTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, look_back=168, target_col='temperature', scaler=None):
        self.look_back = look_back
        self.target_col = target_col
        self.scaler = scaler if scaler else MinMaxScaler()
        
    def create_dataset(self, dataset):
        dataX, dataY = [], []
        for i in range(len(dataset) - self.look_back):
            dataX.append(dataset[i:(i + self.look_back), 0])
            dataY.append(dataset[i + self.look_back, 0])
        return np.array(dataX), np.array(dataY)
    
    def fit(self, X, y=None):
        if not hasattr(self.scaler, 'data_min_'): 
            self.scaler.fit(X[[self.target_col]])
        return self
    
    def transform(self, X):
        scaled = self.scaler.transform(X[[self.target_col]])
        X_ts, y_ts = self.create_dataset(scaled)
        return X_ts.reshape((X_ts.shape[0], X_ts.shape[1], 1)), y_ts

# preprocessing pipeline
def preprocess_data(filepath):
    # read data and select columns
    data = pd.read_csv(filepath, sep=";")
    selected_columns = ['AAAAMMJJHH', 'T', 'RR1', 'NUM_POSTE', 'LAT', 'LON', 'N', 'FF', 'U', 'PSTAT']
    df = data[selected_columns].copy()
    
    # deal with columns
    df['AAAAMMJJHH'] = pd.to_datetime(df['AAAAMMJJHH'], format='%Y%m%d%H')
    df.rename(columns={
        'AAAAMMJJHH': 'date',
        'T': 'temperature',
        'RR1': 'rainfall',
        'N': 'cloud_cover',
        'FF': 'wind_speed',
        'U': 'humidity',
        'PSTAT': 'pressure'
    }, inplace=True)
    
    #  filter for specific station
    df = df.loc[df['NUM_POSTE'] == 20004002].copy()
    df.set_index('date', inplace=True)
    df.interpolate(method='linear', inplace=True)
    
    # add new features rainfall_3h
    df['rainfall_3h'] = df['rainfall'].rolling(window=3, min_periods=1).sum()
    
    # scale features
    scalers = {col: MinMaxScaler() for col in [
        'temperature', 'cloud_cover', 'wind_speed', 
        'humidity', 'pressure', 'rainfall_3h'
    ]}
    
    # scale features
    for col, scaler in scalers.items():
        df[f'{col}_scaled'] = scaler.fit_transform(df[[col]])
    
    return df, scalers

# LSTM model building function

def build_lstm_model(input_shape):
    model = Sequential([
        Input(shape=input_shape), 
        LSTM(64, return_sequences=True),
        LSTM(32),
        Dense(1)
    ])
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae', tf.keras.metrics.RootMeanSquaredError()]
    )
    return model

# main
if __name__ == "__main__":
    df, scalers = preprocess_data("H_20_latest-2024-2025.csv")
    
    preprocessing_artifacts = {
        'scalers': scalers,
        'station_id': 20004002,
        'rolling_window': 3
    }
    with open('preprocessing.pkl', 'wb') as f:
        pickle.dump(preprocessing_artifacts, f)

    #LSTM for temperature prediction
    temp_transformer = TimeSeriesTransformer(
        look_back=168,
        target_col='temperature',
        scaler=preprocessing_artifacts['scalers']['temperature']  # 使用预存scaler
    )
    temp_transformer.fit(df)

    X_temp, y_temp = temp_transformer.transform(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X_temp, y_temp, test_size=0.2, shuffle=False, random_state=42
    )
    
    temp_model = build_lstm_model((X_train.shape[1], 1))
    history = temp_model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=64,
        validation_data=(X_test, y_test),
        callbacks=[EarlyStopping(patience=3, restore_best_weights=True)]
    )
    with open('temperaturemodel.pkl', 'wb') as f:
        pickle.dump(temp_model, f)
    
# LSTM for other features  
    feature_models = {}
    for feature in ['cloud_cover', 'wind_speed', 'humidity', 'pressure', 'rainfall_3h']:
        transformer = TimeSeriesTransformer(
            look_back=72,
            target_col=feature,
            scaler=preprocessing_artifacts['scalers'][feature]
            )
        transformer.fit(df)
        X, y = transformer.transform(df)
        
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        model = build_lstm_model((X_train.shape[1], 1))
        print(f"\nTraining {feature} model...")
        model.fit(
            X_train, y_train,
            epochs=30,
            batch_size=64,
            validation_data=(X_test, y_test),
            verbose=0,
            callbacks=[EarlyStopping(patience=3)]
            )
        feature_models[feature] = model
        del X, y, X_train, X_test, y_train, y_test
        tf.keras.backend.clear_session()

    with open('feature_models.pkl', 'wb') as f:
        pickle.dump({
            'models': feature_models,
            'look_back': 72,
            'feature_order': list(feature_models.keys())
        }, f)

    # XGBoost for rainfall prediction
    df['rain_binary'] = (df['rainfall'] > 0).astype(int)
    features = df[[
        'temperature_scaled', 'cloud_cover_scaled',
        'wind_speed_scaled', 'humidity_scaled',
        'pressure_scaled', 'rainfall_3h_scaled'
    ]]
    
    xgb_pipeline = ImbPipeline([
        ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
        ('model', xgb.XGBClassifier(
            scale_pos_weight=5,
            learning_rate=0.02,
            max_depth=8,
            n_estimators=100,
            random_state=42
        ))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(
        features, df['rain_binary'], 
        test_size=0.2, stratify=df['rain_binary'], random_state=42
    )
    
    xgb_pipeline.fit(X_train, y_train)
    with open('rainmodel.pkl', 'wb') as f:
        pickle.dump(xgb_pipeline, f)

    # Evaluate models
    print("\nRain Model Evaluation:")
    y_pred = xgb_pipeline.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))