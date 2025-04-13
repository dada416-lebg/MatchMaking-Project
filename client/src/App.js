import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// URL du serveur Heroku
const SERVER_URL = 'https://matchmaking-game-822cfdf6085c.herokuapp.com';
console.log('Tentative de connexion à:', SERVER_URL);

function App() {
  const [pseudo, setPseudo] = useState('');
  const [isInQueue, setIsInQueue] = useState(false);
  const [matchState, setMatchState] = useState(null);
  const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const timerRef = useRef(null);

  // Fonction pour établir la connexion
  const connectToServer = () => {
    console.log('Début de la connexion...');
    setConnectionStatus('connecting');
    setErrorMessage('');
    
    const newSocket = io(SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      secure: true,
      rejectUnauthorized: false,
      forceNew: true,
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur avec succès');
      setConnectionStatus('connected');
      setErrorMessage('');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion:', error);
      setConnectionStatus('error');
      setErrorMessage(`Erreur de connexion: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Déconnecté du serveur. Raison:', reason);
      setConnectionStatus('disconnected');
      setErrorMessage(`Déconnecté: ${reason}`);
    });

    newSocket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
      setErrorMessage(`Erreur Socket.IO: ${error.message}`);
    });

    setSocket(newSocket);
  };

  // Connexion initiale
  useEffect(() => {
    connectToServer();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Gestion des événements Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('matchStart', (data) => {
      setMatchState(data);
      setGameStatus('playing');
      setTimeLeft(60);
      setScores({ player1Score: 0, player2Score: 0 });
    });

    socket.on('scoreUpdate', (data) => {
      setScores(data);
    });

    socket.on('matchEnd', (data) => {
      setGameStatus('finished');
      clearInterval(timerRef.current);
    });

    socket.on('playerDisconnected', (data) => {
      alert(`Le joueur ${data.disconnectedPlayer} s'est déconnecté`);
      setGameStatus('waiting');
      setIsInQueue(false);
    });

    return () => {
      socket.off('matchStart');
      socket.off('scoreUpdate');
      socket.off('matchEnd');
      socket.off('playerDisconnected');
    };
  }, [socket]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStatus]);

  const handleJoinQueue = (e) => {
    e.preventDefault();
    if (pseudo.trim()) {
      socket.emit('joinQueue', { pseudo });
      setIsInQueue(true);
    }
  };

  const handleLeaveQueue = () => {
    socket.emit('leaveQueue');
    setIsInQueue(false);
    setPseudo('');
  };

  const handleClick = () => {
    if (gameStatus === 'playing' && matchState) {
      socket.emit('playerClick', matchState.matchId);
    }
  };

  const renderGame = () => {
    if (gameStatus === 'waiting') {
      return (
        <div className="waiting-screen">
          <h2>Click Battle</h2>
          {!isInQueue ? (
            <form onSubmit={handleJoinQueue}>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Entrez votre pseudo"
                required
              />
              <button type="submit">Rejoindre la file d'attente</button>
            </form>
          ) : (
            <div className="queue-status">
              <p>En attente d'un adversaire...</p>
              <button onClick={handleLeaveQueue} className="leave-queue-button">
                Quitter la file d'attente
              </button>
            </div>
          )}
        </div>
      );
    }

    if (gameStatus === 'playing') {
      return (
        <div className="game-screen">
          <div className="game-info">
            <div className="player player1">
              <h3>{matchState.player1.pseudo}</h3>
              <p>Score: {scores.player1Score}</p>
            </div>
            <div className="timer">
              <h2>{timeLeft}s</h2>
            </div>
            <div className="player player2">
              <h3>{matchState.player2.pseudo}</h3>
              <p>Score: {scores.player2Score}</p>
            </div>
          </div>
          <button 
            className="click-button"
            onClick={handleClick}
            disabled={timeLeft === 0}
          >
            CLIQUEZ ICI !
          </button>
        </div>
      );
    }

    if (gameStatus === 'finished') {
      return (
        <div className="game-over">
          <h2>Partie terminée !</h2>
          <div className="final-scores">
            <p>{matchState.player1.pseudo}: {scores.player1Score}</p>
            <p>{matchState.player2.pseudo}: {scores.player2Score}</p>
          </div>
          <div className="game-over-buttons">
            <button 
              onClick={() => {
                setGameStatus('waiting');
                setIsInQueue(false);
                setMatchState(null);
                setPseudo('');
              }}
              className="quit-button"
            >
              Quitter l'application
            </button>
            <button 
              onClick={() => {
                setGameStatus('waiting');
                setIsInQueue(false);
                setMatchState(null);
                handleJoinQueue({ preventDefault: () => {} });
              }}
              className="rematch-button"
            >
              Nouvelle partie
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      {connectionStatus === 'error' && (
        <div className="connection-error">
          <p>Impossible de se connecter au serveur</p>
          <p className="error-details">{errorMessage}</p>
          <button onClick={connectToServer}>Réessayer</button>
        </div>
      )}

      {connectionStatus === 'connecting' && (
        <div className="connection-status">
          <p>Connexion au serveur en cours...</p>
        </div>
      )}

      {connectionStatus === 'connected' && (
        renderGame()
      )}
    </div>
  );
}

export default App;
