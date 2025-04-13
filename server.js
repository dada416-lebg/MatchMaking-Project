const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import des modèles
const Queue = require('./models/Queue');
const Match = require('./models/Match');
const Turn = require('./models/Turn');

const app = express();
const server = http.createServer(app);

// Configuration pour forcer la fermeture des connexions existantes
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  perMessageDeflate: true,
  httpCompression: true,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  // Force la fermeture des connexions existantes
  forceNew: true
});

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du client en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Connexion à MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/click-battle?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB Atlas'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB Atlas:', err);
  process.exit(1); // Arrêter l'application si la connexion échoue
});

// File d'attente des joueurs
let waitingQueue = [];
// Matchs en cours
let activeMatches = new Map();

// Gestion des connexions Socket.IO
io.on('connection', async (socket) => {
  console.log('Nouveau client connecté:', socket.id);

  // Rejoindre la file d'attente
  socket.on('joinQueue', async (data) => {
    try {
      console.log('Tentative de rejoindre la file d\'attente:', data.pseudo);
      
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

      waitingQueue.push(player);
      console.log(`Joueur ${data.pseudo} a rejoint la file d'attente. File actuelle:`, waitingQueue.map(p => p.pseudo));
      
      // Vérifier s'il y a assez de joueurs pour créer un match
      if (waitingQueue.length >= 2) {
        console.log('Assez de joueurs pour créer un match');
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
        
        console.log(`Match démarré entre ${player1.pseudo} et ${player2.pseudo}`);
        
        // Démarrer le timer du match
        setTimeout(() => endMatch(match.id), 60000);
      } else {
        console.log('En attente d\'un autre joueur...');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de joinQueue:', error);
    }
  });

  socket.on('leaveQueue', async () => {
    const index = waitingQueue.findIndex(player => player.id === socket.id);
    if (index !== -1) {
      const player = waitingQueue[index];
      console.log(`Joueur ${player.pseudo} a quitté la file d'attente`);
      
      // Mettre à jour dans la base de données
      await Queue.findOneAndUpdate(
        { playerId: player.id },
        { isActive: false, leaveTime: new Date() }
      );
      
      waitingQueue.splice(index, 1);
    }
  });

  // Gérer les clics pendant le match
  socket.on('playerClick', async (matchId) => {
    const match = activeMatches.get(matchId);
    if (match && !match.isFinished) {
      let playerType = socket.id === match.player1.id ? 'player1' : 'player2';
      
      // Mettre à jour le score
      if (playerType === 'player1') {
        match.player1Score++;
      } else {
        match.player2Score++;
      }
      
      // Sauvegarder le tour dans la base de données
      const turn = new Turn({
        matchId: match._id,
        player: playerType,
        move: { type: 'click', timestamp: new Date() }
      });
      await turn.save();
      
      // Informer les deux joueurs du score mis à jour
      const scoreUpdate = {
        player1Score: match.player1Score,
        player2Score: match.player2Score
      };
      
      io.to(matchId).emit('scoreUpdate', scoreUpdate);
      console.log(`Score mis à jour - Match ${matchId}: ${match.player1Score} - ${match.player2Score}`);
    }
  });

  // Déconnexion
  socket.on('disconnect', async () => {
    console.log('Client déconnecté:', socket.id);
    await Queue.findOneAndUpdate(
      { playerId: socket.id },
      { isActive: false, leaveTime: new Date() }
    );
    removePlayerFromQueue(socket.id);
    handlePlayerDisconnect(socket.id);
  });
});

// Fonction pour terminer un match
async function endMatch(matchId) {
  const match = activeMatches.get(matchId);
  if (match && !match.isFinished) {
    match.isFinished = true;
    
    // Déterminer le gagnant
    let winner = null;
    if (match.player1Score > match.player2Score) {
      winner = 'player1';
    } else if (match.player2Score > match.player1Score) {
      winner = 'player2';
    } else {
      winner = 'draw';
    }
    match.winner = winner;
    
    // Mettre à jour le match dans la base de données
    await Match.findByIdAndUpdate(match._id, {
      isFinished: true,
      winner: winner,
      endTime: new Date(),
      'player1.score': match.player1Score,
      'player2.score': match.player2Score
    });
    
    // Informer les joueurs de la fin du match
    const matchEndData = {
      winner: winner === 'player1' ? match.player1.pseudo :
              winner === 'player2' ? match.player2.pseudo :
              'Égalité',
      player1Score: match.player1Score,
      player2Score: match.player2Score,
      endTime: new Date()
    };
    
    io.to(matchId).emit('matchEnd', matchEndData);
    console.log(`Match terminé - ${matchId}: ${matchEndData.winner} a gagné`);
    
    // Nettoyer le match
    activeMatches.delete(matchId);
  }
}

// Fonction pour retirer un joueur de la file d'attente
function removePlayerFromQueue(playerId) {
  waitingQueue = waitingQueue.filter(player => player.id !== playerId);
}

// Fonction pour gérer la déconnexion d'un joueur
async function handlePlayerDisconnect(playerId) {
  for (const [matchId, match] of activeMatches.entries()) {
    if (match.player1.id === playerId || match.player2.id === playerId) {
      const disconnectedPlayer = match.player1.id === playerId ? match.player1 : match.player2;
      const remainingPlayer = match.player1.id === playerId ? match.player2 : match.player1;
      
      // Mettre à jour le match dans la base de données
      await Match.findByIdAndUpdate(match._id, {
        isFinished: true,
        winner: remainingPlayer.id === match.player1.id ? 'player1' : 'player2',
        endTime: new Date(),
        disconnect: true,
        disconnectedPlayer: disconnectedPlayer.pseudo
      });
      
      // Informer le joueur restant
      io.to(matchId).emit('playerDisconnected', {
        disconnectedPlayer: disconnectedPlayer.pseudo
      });
      
      endMatch(matchId);
    }
  }
}

const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Pour vous connecter depuis un autre appareil, utilisez l\'adresse IP de cet ordinateur');
}); 