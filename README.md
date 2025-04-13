# Click Battle 🎮

Un jeu multijoueur en temps réel où les joueurs s'affrontent dans une bataille de clics. Développé avec React, Node.js et Socket.IO.

## 🎯 Présentation

Click Battle est un jeu en ligne où deux joueurs s'affrontent dans une compétition de rapidité. Le but est simple : cliquer le plus rapidement possible pour marquer des points avant son adversaire.

### Fonctionnalités principales

- 🎮 Matchmaking automatique
- ⚡ Bataille de clics en temps réel
- 📊 Système de score dynamique
- 💻 Application de bureau disponible
- 🌐 Version web accessible

## 🚀 Comment Jouer

### Méthode Simple (Recommandée) 🎮

1. **Téléchargez l'application**
   - Allez dans l'onglet "Releases" de ce dépôt GitHub
   - Téléchargez le fichier 7ZIP de la dernière version
   - Extrayez le contenu du 7ZIP
   - Vous trouverez l'exécutable `Click Battle Setup 1.0.0.exe` dans le dossier extrait

2. **Installez l'application**
   - Exécutez le fichier `Click Battle Setup 1.0.0.exe`
   - Suivez les instructions à l'écran
   - L'application sera installée dans votre menu Démarrer

3. **Lancez et jouez !**
   - Ouvrez l'application depuis le menu Démarrer
   - Cliquez sur "Rejoindre la file d'attente"
   - Attendez qu'un adversaire soit trouvé
   - Cliquez le plus rapidement possible pour gagner !

### Méthode Développeur (Pour les contributeurs) 💻

Cette méthode est uniquement nécessaire si vous souhaitez contribuer au développement du jeu.

#### Prérequis
- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- MongoDB Atlas (pour la base de données)

#### Installation
1. **Clonez le dépôt**
```bash
git clone https://github.com/votre-username/click-battle.git
cd click-battle
```

2. **Installez les dépendances**
```bash
# Installation des dépendances du serveur
npm install

# Installation des dépendances du client
cd client
npm install
cd ..
```

3. **Configuration**
Créez un fichier `.env` à la racine du projet :
```env
MONGODB_URI=votre_uri_mongodb
PORT=5001
```

4. **Lancement en mode développement**
```bash
npm run dev:full
```

## 🏗️ Structure du Projet

```
click-battle/
├── client/                 # Application React
│   ├── public/            # Fichiers statiques
│   └── src/               # Code source React
│       ├── components/    # Composants React
│       ├── App.js         # Composant principal
│       └── App.css        # Styles CSS
├── server/                # Backend Node.js
│   ├── models/           # Modèles MongoDB
│   ├── routes/           # Routes API
│   └── server.js         # Serveur principal
├── electron/             # Configuration Electron
├── package.json          # Dépendances et scripts
└── README.md            # Documentation
```

## 🔧 Technologies Utilisées

- **Frontend** : React.js, Socket.IO Client
- **Backend** : Node.js, Express, Socket.IO
- **Base de données** : MongoDB Atlas
- **Application de bureau** : Electron
- **Hébergement** : Heroku

