import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Récupérer l'adresse IP du serveur depuis l'URL ou utiliser l'URL Heroku par défaut
const SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://votre-app-heroku.herokuapp.com'
  : 'http://localhost:5001';

const socket = io(SERVER_URL);

function App() {
  const [pseudo, setPseudo] = useState('');
  const [isInQueue, setIsInQueue] = useState(false);
  const [matchState, setMatchState] = useState(null);
  const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  const timerRef = useRef(null);

  useEffect(() => {
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
  }, []);

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
      {renderGame()}
    </div>
  );
}

export default App;
