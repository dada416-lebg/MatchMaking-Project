const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Création du dossier logs s'il n'existe pas
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configuration du système de logs
const logStream = fs.createWriteStream(path.join(logDir, 'server.log'), { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logMessage);
};

// Import des modèles
const Queue = require('./models/Queue');
const Match = require('./models/Match');
const Turn = require('./models/Turn');

const app = express();
app.use(cors({
  origin: ['https://matchmaking-game-822cfdf6085c.herokuapp.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => log('Connecté à MongoDB Atlas'))
  .catch(err => log(`Erreur de connexion à MongoDB: ${err.message}`));

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  log(`Serveur démarré sur le port ${PORT}`);
});

// Configuration Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ['https://matchmaking-game-822cfdf6085c.herokuapp.com', 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  transports: ['websocket'],
  allowUpgrades: false,
  perMessageDeflate: true,
  httpCompression: true,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  path: '/socket.io/',
  forceNew: true
});

// Log de la configuration Socket.IO
log('Socket.IO configuré avec les options:');
log(JSON.stringify({
  cors: io.engine.opts.cors,
  transports: io.engine.opts.transports,
  path: io.engine.opts.path
}, null, 2));

// Gestion des connexions Socket.IO
io.on('connection', async (socket) => {
  log(`Nouveau client connecté: ${socket.id}`);

  // Rejoindre la file d'attente
  socket.on('joinQueue', async (data) => {
    try {
      log(`Tentative de rejoindre la file d'attente: ${data.pseudo}`);
      
      const player = {
        id: socket.id,
        pseudo: data.pseudo,
        socket: socket
      };

      // Sauvegarder dans la base de données
      const queueEntry = new Queue({
        playerId: player.id,
        pseudo: player.pseudo,
        joinTime: new Date(),
        isActive: true
      });
      await queueEntry.save();
      log(`Joueur ${data.pseudo} sauvegardé dans la base de données`);

      waitingQueue.push(player);
      log(`Joueur ${data.pseudo} a rejoint la file d'attente. File actuelle: ${waitingQueue.map(p => p.pseudo).join(', ')}`);
      
      // Vérifier s'il y a assez de joueurs pour créer un match
      if (waitingQueue.length >= 2) {
        log('Assez de joueurs pour créer un match');
        const player1 = waitingQueue.shift();
        const player2 = waitingQueue.shift();
        
        // Créer le match dans la base de données
        const matchDoc = new Match({
          player1: {
            id: player1.id,
            pseudo: player1.pseudo,
            score: 0
          },
          player2: {
            id: player2.id,
            pseudo: player2.pseudo,
            score: 0
          },
          startTime: new Date(),
          isFinished: false
        });
        await matchDoc.save();
        
        const match = {
          _id: matchDoc._id,
          id: Date.now().toString(),
          player1: player1,
          player2: player2,
          player1Score: 0,
          player2Score: 0,
          startTime: Date.now(),
          isFinished: false,
          winner: null
        };
        
        activeMatches.set(match.id, match);
        
        // Ajouter les joueurs à la room du match
        player1.socket.join(match.id);
        player2.socket.join(match.id);
        
        // Informer les joueurs du début du match
        const matchData = {
          matchId: match.id,
          player1: { pseudo: player1.pseudo },
          player2: { pseudo: player2.pseudo },
          startTime: match.startTime
        };
        
        player1.socket.emit('matchStart', matchData);
        player2.socket.emit('matchStart', matchData);
        
        log(`Match démarré entre ${player1.pseudo} et ${player2.pseudo}`);
        
        // Démarrer le timer du match
        setTimeout(() => endMatch(match.id), 60000);
      } else {
        log('En attente d\'un autre joueur...');
      }
    } catch (error) {
      log(`Erreur lors de la gestion de joinQueue: ${error.message}`);
    }
  });

  // ... rest of the code ...
});

// ... rest of the existing code ... 