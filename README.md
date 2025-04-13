# Click Battle - Jeu de Matchmaking

Un jeu simple où deux joueurs s'affrontent en cliquant le plus rapidement possible pendant une minute.

## Fonctionnalités

- Système de matchmaking en temps réel
- Interface utilisateur moderne et responsive
- Compteur de temps et de score en direct
- Gestion des déconnexions
- File d'attente automatique

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

## Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd MatchMaking-Project
```

2. Installez les dépendances du serveur :
```bash
npm install
```

3. Installez les dépendances du client :
```bash
cd client
npm install
```

## Lancement

1. Démarrez le serveur (depuis la racine du projet) :
```bash
npm start
```

2. Dans un autre terminal, démarrez le client :
```bash
cd client
npm start
```

3. Ouvrez votre navigateur et accédez à `http://localhost:3000`

## Comment jouer

1. Entrez votre pseudo et cliquez sur "Rejoindre la file d'attente"
2. Attendez qu'un autre joueur se connecte
3. Une fois le match commencé, cliquez le plus rapidement possible sur le bouton central
4. Après une minute, le gagnant est celui qui a le plus de clics

## Structure du projet

```
MatchMaking-Project/
├── client/                 # Application React
│   ├── src/
│   │   ├── App.js         # Composant principal
│   │   └── App.css        # Styles
│   └── package.json
├── server.js              # Serveur de matchmaking
└── package.json
```

## Technologies utilisées

- Frontend : React.js
- Backend : Node.js, Express
- Communication en temps réel : Socket.IO
- Style : CSS moderne avec animations 