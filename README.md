## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

1. **Docker** : Installez Docker en suivant les instructions officielles : [Docker Documentation](https://docs.docker.com/get-docker/).
2. **Docker Compose** : Docker Compose est inclus avec Docker Desktop, ou vous pouvez l'installer séparément si nécessaire. Vérifiez l'installation avec :
   ```bash
   docker-compose --version
   ```

---
**Créer un fichier `.env`** :
   - Copiez le contenu du fichier `envtemplate` et personnalisez-le selon vos besoins spécifiques.
---

## Lancer le Projet

1. **Vérifiez que les ports nécessaires sont disponibles** :
   - Assurez-vous que les ports spécifiés dans le fichier `docker-compose.yml` (par exemple : `3000`, `5000`, etc.) ne sont pas utilisés par d'autres applications.

2. **Construire et lancer les services avec Docker Compose** :
   - Commande pour démarrer le projet :
     ```bash
     sudo docker-compose up --build -d
     ```
   - Cette commande :
     - `--build` : Reconstruit les images si nécessaire.
     - `-d` : Exécute les conteneurs en arrière-plan (mode détaché).

3. **Accédez à l'application** :
   - Ouvrez votre navigateur et accédez à :
     ```
     http://localhost

     uikafka : localhost:8080
     prometheus: localhost:9090
     grafana: localhost:3000
## Gestion des Conteneurs et des Ressources

1. **Arrêter les services** :
   - Pour arrêter les conteneurs en cours d'exécution :
     ```bash
     sudo docker-compose down
     ```

2. **Nettoyer les images et volumes Docker** :
   - Supprimer les images inutilisées :
     ```bash
     sudo docker image prune -a
     ```
   - Supprimer les volumes inutilisés :
     ```bash
     sudo docker volume prune
     ```

3. **Supprimer tous les conteneurs** (si nécessaire) :
   ```bash
   sudo docker container prune
