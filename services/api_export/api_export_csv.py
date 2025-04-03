from fastapi import FastAPI, Response
import csv, io, logging, os
from pymongo import MongoClient

app = FastAPI()
# Exposed endpoint : http://localhost:8000/export-csv

# Logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Mongo Configuration
MONGO_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME")
MONGO_PASS = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@ter_mongodb:27017/"
client = MongoClient(MONGO_URI)
db = client["weatherDB"]
collection_ai = db["weatherData_AI"]

# Mappining dict from API to expected CSV
mapping = {
    "NUM_POSTE": "POSTE",        # Pour NUM_POSTE, on utilise le champ "POSTE"
    "AAAAMMJJHH": "DATE"         # Pour AAAAMMJJHH, on utilise le champ "DATE"
}

# Static values from Ajaccio station
defaults = {
    "NOM_USUEL": "AJACCIO",
    "LAT": "41.918",
    "LON": "8.792667",
    "ALTI": "5"
}

# Header for AI processing
header_line = (
    "NUM_POSTE;NOM_USUEL;LAT;LON;ALTI;AAAAMMJJHH;RR1;QRR1;DRR1;QDRR1;"
    "FF;QFF;DD;QDD;FXY;QFXY;DXY;QDXY;HXY;QHXY;FXI;QFXI;DXI;QDXI;"
    "HXI;QHXI;FF2;QFF2;DD2;QDD2;FXI2;QFXI2;DXI2;QDXI2;HXI2;QHXI2;"
    "FXI3S;QFXI3S;DXI3S;QDXI3S;HFXI3S;QHFXI3S;T;QT;TD;QTD;TN;QTN;"
    "HTN;QHTN;TX;QTX;HTX;QHTX;DG;QDG;T10;QT10;T20;QT20;T50;QT50;"
    "T100;QT100;TNSOL;QTNSOL;TN50;QTN50;TCHAUSSEE;QTCHAUSSEE;DHUMEC;"
    "QDHUMEC;U;QU;UN;QUN;HUN;QHUN;UX;QUX;HUX;QHUX;DHUMI40;QDHUMI40;"
    "DHUMI80;QDHUMI80;TSV;QTSV;PMER;QPMER;PSTAT;QPSTAT;PMERMIN;QPMERMIN;"
    "GEOP;QGEOP;N;QN;NBAS;QNBAS;CL;QCL;CM;QCM;CH;QCH;N1;QN1;C1;QC1;"
    "B1;QB1;N2;QN2;C2;QC2;B2;QB2;N3;QN3;C3;QC3;B3;QB3;N4;QN4;C4;"
    "QC4;B4;QB4;VV;QVV;DVV200;QDVV200;WW;QWW;W1;QW1;W2;QW2;SOL;QSOL;"
    "SOLNG;QSOLNG;TMER;QTMER;VVMER;QVVMER;ETATMER;QETATMER;DIRHOULE;"
    "QDIRHOULE;HVAGUE;QHVAGUE;PVAGUE;QPVAGUE;HNEIGEF;QHNEIGEF;NEIGETOT;"
    "QNEIGETOT;TSNEIGE;QTSNEIGE;TUBENEIGE;QTUBENEIGE;HNEIGEFI3;QHNEIGEFI3;"
    "HNEIGEFI1;QHNEIGEFI1;ESNEIGE;QESNEIGE;CHARGENEIGE;QCHARGENEIGE;"
    "GLO;QGLO;GLO2;QGLO2;DIR;QDIR;DIR2;QDIR2;DIF;QDIF;DIF2;QDIF2;"
    "UV;QUV;UV2;QUV2;UV_INDICE;QUV_INDICE;INFRAR;QINFRAR;INFRAR2;QINFRAR2;"
    "INS;QINS;INS2;QINS2;TLAGON;QTLAGON;TVEGETAUX;QTVEGETAUX;ECOULEMENT;QECOULEMENT"
)
headers = header_line.split(";")

@app.get("/export-csv")
def export_csv():
    documents = list(collection_ai.find())
    logger.info("Documents récupérés: %d", len(documents))
    if not documents:
        return Response(content="Aucune donnée trouvée", media_type="text/plain")
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, delimiter=';')
    writer.writeheader()
    
    # For each documents, check if "rows" exists
    for doc in documents:
        if "rows" in doc and isinstance(doc["rows"], list):
            # Parse each document in "rows"
            for data in doc["rows"]:
                row = {}
                for h in headers:
                    if h in mapping:
                        v = data.get(mapping[h], "")
                        # Convert float to int for specific headers
                        if h in ("NUM_POSTE", "AAAAMMJJHH") and isinstance(v, (float, int)):
                            v = str(int(v))
                        row[h] = v
                    elif h in defaults:
                        row[h] = data.get(h, defaults[h])
                    else:
                        row[h] = data.get(h, "")
                logger.info("Row générée: %s", row)
                writer.writerow(row)
        else:
            # If "rows" does not exist, process the document directly
            row = {}
            for h in headers:
                if h in mapping:
                    v = doc.get(mapping[h], "")
                    if h == "AAAAMMJJHH" and isinstance(v, (float, int)):
                        v = str(int(v))
                    row[h] = v
                elif h in defaults:
                    row[h] = doc.get(h, defaults[h])
                else:
                    row[h] = doc.get(h, "")
            logger.info("Row générée (document direct): %s", row)
            writer.writerow(row)
    
    csv_content = output.getvalue()
    output.close()
    
    # Create a downloadable CSV response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=weatherData_AI.csv"}
    )
