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

## 🚀 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- MongoDB Atlas (pour la base de données)

### Installation Locale

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

### Installation de l'Application de Bureau

1. **Téléchargement**
   - Rendez-vous sur la section "Releases" du projet
   - Téléchargez `Click Battle Setup 1.0.0.exe`

2. **Installation**
   - Exécutez le fichier d'installation
   - Suivez les instructions à l'écran
   - L'application sera installée dans votre menu Démarrer

3. **Premier lancement**
   - Ouvrez l'application depuis le menu Démarrer
   - L'application se connectera automatiquement au serveur

## 🎮 Comment Jouer

1. Lancez l'application (bureau ou web)
2. Cliquez sur "Rejoindre la file d'attente"
3. Attendez qu'un adversaire soit trouvé
4. Une fois le match commencé, cliquez le plus rapidement possible
5. Le premier à atteindre 100 points remporte la partie

## 🔧 Technologies Utilisées

- **Frontend** : React.js, Socket.IO Client
- **Backend** : Node.js, Express, Socket.IO
- **Base de données** : MongoDB Atlas
- **Application de bureau** : Electron
- **Hébergement** : Heroku

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 