from flask import Flask, render_template
import pandas as pd
import requests
import csv
from io import StringIO
from collections import deque
import pickle
import numpy as np
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)

# -----------------------------
# 1. download the models
# -----------------------------
with open("temperaturemodel.pkl", "rb") as temp_model_file:
    temp_model = pickle.load(temp_model_file)

with open("rainmodel.pkl", "rb") as rain_model_file:
    xgb_model = pickle.load(rain_model_file)

def ligne_existe(deja_lues, nouvelle_ligne):
    cle = str(nouvelle_ligne["AAAAMMJJHH"]).strip()
    return cle in deja_lues

def charger_cle_csv(fichier):
    try:
        with open(fichier, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            deja_lues = deque()
            for row in reader:
                deja_lues.append(str(row['AAAAMMJJHH']))
            return set(deja_lues)
    except FileNotFoundError:
        return set()

def mettre_a_jour_csv():
    url = "http://localhost:8000/export-csv"
    fichier_csv_local = "weatherData_AI.csv"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            csv_text = response.text
            df = pd.read_csv(StringIO(csv_text), sep=";")
            deja_lues = charger_cle_csv(fichier_csv_local)
            nouvelles_lignes = []
            for _, row in df.iterrows():
                if not ligne_existe(deja_lues, row):
                    nouvelles_lignes.append(row)
            if nouvelles_lignes:
                nouvelles_lignes_df = pd.DataFrame(nouvelles_lignes)
                nouvelles_lignes_df.to_csv(fichier_csv_local, mode='a', header=False, index=False, sep=";")
                print(f"{len(nouvelles_lignes)} nouvelles lignes ajoutées.")
            else:
                print("Aucune nouvelle ligne à ajouter.")
        else:
            print(f"Erreur lors du téléchargement : {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Erreur réseau : {e}")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    # Mise à jour des données avant la prédiction
    mettre_a_jour_csv()

    # Charger les données météo locales
    df = pd.read_csv("weatherData_AI.csv", sep=";")
    df = pd.read_csv("H_20_latest-2024-2025.csv", sep=";")
    df.fillna(0, inplace=True)  #utilise 0 remplit les colonnes vide 

    # Supposons qu'on retire juste la date pour prédire
    selected_columns = ['AAAAMMJJHH', 'T', 'RR1', 'NUM_POSTE', 'LAT', 'LON', 'N', 'FF', 'U', 'PSTAT']
    df = df[selected_columns].copy()

    # traitement des colonnes
    df['AAAAMMJJHH'] = pd.to_datetime(df['AAAAMMJJHH'], format='%Y%m%d%H', errors='coerce')
    if df['AAAAMMJJHH'].isnull().any():
        print("Warning: Some dates could not be parsed correctly.")

    df.rename(columns={'AAAAMMJJHH': 'date', 'T': 'temperature', 'RR1': 'rainfall',
                       'N': 'cloud_cover', 'FF': 'wind_speed', 'U': 'humidity', 'PSTAT': 'pressure'}, inplace=True)

    # scaler les features
    scalers = {col: MinMaxScaler() for col in ['temperature', 'rainfall', 'cloud_cover', 'wind_speed', 'humidity', 'pressure']}
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
    # 4. predict rainfall (using XGBoost model)
    # -----------------------------
    future_cloud_cover = np.random.uniform(df['cloud_cover'].min(), df['cloud_cover'].max(), size=pred_hours)
    future_pressure = np.random.uniform(df['pressure'].min(), df['pressure'].max(), size=pred_hours)
    future_wind_speed = np.random.uniform(df['wind_speed'].min(), df['wind_speed'].max(), size=pred_hours)
    future_humidity = np.random.uniform(df['humidity'].min(), df['humidity'].max(), size=pred_hours)
    future_rain_3h = np.random.uniform(df['rainfall'].min(), df['rainfall'].max(), size=pred_hours)

    future_temp = predicted_temps.flatten()

    future_features = np.column_stack((future_temp, future_cloud_cover, future_wind_speed, future_humidity, future_pressure, future_rain_3h))

    future_rain_prob = xgb_model.predict_proba(future_features)[:, 1]
    print(df['date'].head())
    
    dates_future = pd.date_range(df['date'].iloc[-1], periods=pred_hours + 1, freq='H')[1:]

    print("Last Date in DataFrame:", df['date'].iloc[-1])
    # Construire un DataFrame avec les résultats
    result_df = pd.DataFrame({
        "Date": dates_future,
        "Température Prédite": predicted_temps.flatten(),
        "Probabilité Précipitation": future_rain_prob
    })
    # Ensure that any newline, carriage return, or unwanted whitespace is replaced
    tables=[result_df.to_html(classes='data', index=False)]
    tables_clean = [table.replace("\n", " ").replace("\r", "").replace("\t", "").strip() for table in tables]
    # Rendre les résultats dans le même template
    return render_template("index.html", tables=tables_clean)

if __name__ == '__main__':
    app.run(debug=True)

