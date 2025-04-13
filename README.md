# Click Battle - Jeu de Bataille de Clics en Temps Réel

Un jeu multijoueur en temps réel où les joueurs s'affrontent dans une bataille de clics.

## Fonctionnalités

- Matchmaking automatique
- Bataille de clics en temps réel
- Système de score
- Interface utilisateur intuitive
- Application de bureau disponible

## Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- MongoDB Atlas (pour la base de données)

### Installation Locale

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/click-battle.git
cd click-battle
```

2. Installez les dépendances :
```bash
npm install
cd client
npm install
cd ..
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec :
```
MONGODB_URI=votre_uri_mongodb
PORT=5001
```

4. Lancez l'application en mode développement :
```bash
npm run dev:full
```

## Déploiement

### Sur Heroku

1. Créez un compte Heroku
2. Installez Heroku CLI
3. Connectez-vous à Heroku :
```bash
heroku login
```

4. Créez une application Heroku :
```bash
heroku create votre-app-heroku
```

5. Configurez les variables d'environnement :
```bash
heroku config:set MONGODB_URI=votre_uri_mongodb
heroku config:set NODE_ENV=production
```

6. Déployez l'application :
```bash
git push heroku main
```

### Application de Bureau

Une application de bureau est disponible pour une meilleure expérience utilisateur :

1. Téléchargez l'installateur depuis la section "Releases"
2. Exécutez `Click Battle Setup 1.0.0.exe`
3. Suivez les instructions d'installation
4. Lancez l'application depuis le menu Démarrer

## Comment Jouer

1. Lancez l'application
2. Cliquez sur "Rejoindre la file d'attente"
3. Attendez qu'un adversaire soit trouvé
4. Cliquez le plus rapidement possible pour gagner des points
5. Le premier à atteindre 100 points gagne la partie

## Technologies Utilisées

- Frontend : React.js
- Backend : Node.js, Express
- Base de données : MongoDB Atlas
- Communication en temps réel : Socket.IO
- Application de bureau : Electron
- Hébergement : Heroku

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 