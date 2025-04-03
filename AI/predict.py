import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

# -----------------------------
# 1. download the models
# -----------------------------
with open("temperaturemodel.pkl", "rb") as temp_model_file:
    temp_model = pickle.load(temp_model_file)

with open("rainmodel.pkl", "rb") as rain_model_file:
    xgb_model = pickle.load(rain_model_file)

# -----------------------------
# 2. read new data and prerpocessing
# -----------------------------
# read new data needs to be changed
new_data = pd.read_csv("new_H_20_latest-2024-2025.csv", sep=";")

selected_columns = ['AAAAMMJJHH', 'T', 'RR1', 'NUM_POSTE', 'LAT', 'LON', 'N', 'FF', 'U', 'PSTAT']
df = new_data[selected_columns].copy()

# deal with columns
df['AAAAMMJJHH'] = pd.to_datetime(df['AAAAMMJJHH'], format='%Y%m%d%H')
df.rename(columns={'AAAAMMJJHH': 'date', 'T': 'temperature', 'RR1': 'rainfall',
                   'N': 'cloud_cover', 'FF': 'wind_speed', 'U': 'humidity', 'PSTAT': 'pressure'}, inplace=True)

# chose special station 2000402
df = df.loc[df['NUM_POSTE'] == 20004002]
df.set_index('date', inplace=True)
df.interpolate(method='linear', inplace=True)  # fill missing values

# add new features rainfall_3h
df['rainfall_3h'] = df['rainfall'].rolling(window=3, min_periods=1).sum()

# scale features
scalers = {col: MinMaxScaler() for col in ['temperature', 'rainfall', 'cloud_cover', 'wind_speed', 'humidity', 'pressure', 'rainfall_3h']}
for col, scaler in scalers.items():
    df[f'{col}_scaled'] = scaler.fit_transform(df[[col]])

# -----------------------------
# 3. predict temperature (using LSTM model)
# -----------------------------
look_back = 72
data_scaled = df[['temperature_scaled']].values
X_temp = np.array([data_scaled[i:(i + look_back), 0] for i in range(len(data_scaled) - look_back)])
X_temp = X_temp.reshape((X_temp.shape[0], X_temp.shape[1], 1))

# predict temperature in the next 5 days
pred_hours = 5 * 24
input_seq = X_temp[-1].reshape(1, X_temp.shape[1], 1)
predicted_temps = []

for _ in range(pred_hours):
    pred = temp_model.predict(input_seq, verbose=0)[0][0]
    predicted_temps.append(pred)
    input_seq = np.roll(input_seq, -1, axis=1)
    input_seq[0, -1, 0] = pred

predicted_temps = scalers['temperature'].inverse_transform(np.array(predicted_temps).reshape(-1, 1))

# -----------------------------
# 4. predict rainfall（using XGBoost model）
# -----------------------------
# generate future features
future_cloud_cover = np.random.uniform(df['cloud_cover'].min(), df['cloud_cover'].max(), size=pred_hours)
future_pressure = np.random.uniform(df['pressure'].min(), df['pressure'].max(), size=pred_hours)
future_wind_speed = np.random.uniform(df['wind_speed'].min(), df['wind_speed'].max(), size=pred_hours)
future_humidity = np.random.uniform(df['humidity'].min(), df['humidity'].max(), size=pred_hours)
future_rain_3h = np.random.uniform(df['rainfall_3h'].min(), df['rainfall_3h'].max(), size=pred_hours)

future_temp = predicted_temps.flatten()

future_features = np.column_stack((future_temp, future_cloud_cover, future_wind_speed, future_humidity, future_pressure, future_rain_3h))

future_rain_prob = xgb_model.predict_proba(future_features)[:, 1]

# -----------------------------
# 5. visiualization of the prediction
# -----------------------------

