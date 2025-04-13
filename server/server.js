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
app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => log('Connecté à MongoDB Atlas'))
  .catch(err => log(`Erreur de connexion à MongoDB: ${err.message}`));

// ... existing code ...

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
      
      // ... rest of the existing code ...
    } catch (error) {
      log(`Erreur lors de la gestion de joinQueue: ${error.message}`);
    }
  });

  // ... rest of the existing code ...
});

// ... rest of the existing code ... 