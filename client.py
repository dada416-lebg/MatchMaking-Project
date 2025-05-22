### client.py
import socket
import json
import threading
import tkinter as tk
from tkinter import messagebox
import random
import os
import datetime

HOST = 'localhost'
PORT = 5555

SCORE_FILE = "scores.json"

class ClientGame:
    def __init__(self, use_ai=False):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.pseudo = ""
        self.use_ai = use_ai
        self.board = [' '] * 9
        self.symbol = 'X'
        self.opponent_symbol = 'O'
        self.window = tk.Tk()
        self.buttons = []
        self.status_label = tk.Label(self.window, text="En attente...", font=("Helvetica", 14))
        self.my_turn = False
        self.scores = {"win": 0, "loss": 0, "draw": 0}
        self.history = []
        self.load_scores()

    def connect(self):
        self.socket.connect((HOST, PORT))
        self.pseudo = input("Entrez votre pseudo: ")
        self.socket.sendall(self.pseudo.encode())
        threading.Thread(target=self.listen_server, daemon=True).start()
        self.launch_ui()

    def listen_server(self):
        while True:
            data = self.socket.recv(1024)
            if not data:
                break
            try:
                message = json.loads(data.decode())
                if message.get("type") == "update_board":
                    self.board = message["board"]
                    self.update_board_buttons()
                    self.my_turn = message["your_turn"]
                    if self.my_turn:
                        self.update_status("Votre tour")
                        if self.use_ai:
                            self.play_ai()
                    else:
                        self.update_status("Tour de l'adversaire")
                elif message.get("type") == "game_over":
                    self.board = message["board"]
                    self.update_board_buttons()
                    self.update_status(message["result"])
                    self.handle_end_game(message["result"])
            except json.JSONDecodeError:
                self.update_status(data.decode().strip())

    def play_ai(self):
        best_move = self.minimax(self.board, self.symbol)[1]
        if best_move is not None:
            self.send_move(best_move)

    def minimax(self, board, player):
        opponent = 'O' if player == 'X' else 'X'
        winner = self.check_winner(board)
        if winner == self.symbol:
            return (1, None)
        elif winner == self.opponent_symbol:
            return (-1, None)
        elif ' ' not in board:
            return (0, None)

        moves = []
        for i in range(9):
            if board[i] == ' ':
                new_board = board[:]
                new_board[i] = player
                score = self.minimax(new_board, opponent)[0]
                moves.append((score, i))

        if player == self.symbol:
            return max(moves)
        else:
            return min(moves)

    def check_winner(self, board):
        lines = [(0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6)]
        for i,j,k in lines:
            if board[i] == board[j] == board[k] and board[i] != ' ':
                return board[i]
        return None

    def send_move(self, pos):
        if self.my_turn and self.board[pos] == ' ':
            msg = json.dumps({"action": "play", "position": pos})
            self.socket.sendall(msg.encode())

    def launch_ui(self):
        self.window.title("Matchmaking Game")
        self.status_label.pack(pady=10)
        frame = tk.Frame(self.window)
        frame.pack()

        for i in range(9):
            btn = tk.Button(frame, text=" ", width=10, height=5, font=("Helvetica", 16), command=lambda i=i: self.send_move(i))
            btn.grid(row=i//3, column=i%3)
            self.buttons.append(btn)

        tk.Button(self.window, text="Historique", command=self.show_history).pack(pady=5)
        self.window.mainloop()

    def update_board_buttons(self):
        for i, val in enumerate(self.board):
            self.buttons[i]["text"] = val

    def update_status(self, msg):
        self.status_label["text"] = msg.strip()

    def handle_end_game(self, result):
        if "gagne" in result.lower():
            self.scores["win"] += 1
        elif "perdu" in result.lower():
            self.scores["loss"] += 1
        else:
            self.scores["draw"] += 1

        self.history.append({
            "date": str(datetime.datetime.now()),
            "result": result
        })
        self.save_scores()
        self.history.append({
        "date": datetime.now().isoformat(),
        "result": result,
        "board": self.board.copy(),
        "opponent": self.opponent_symbol,
        "duration": (datetime.now() - self.start_time).total_seconds()
    })
    
    if "gagne" in result.lower():
        self.scores["win"] += 1
        

        play_again = messagebox.askyesno("Partie terminée", f"{result}\n\nVoulez-vous rejouer ?")
        if play_again:
            self.reset_game()
        else:
            self.window.quit()

    def reset_game(self):
        self.board = [' '] * 9
        self.update_board_buttons()
        self.update_status("Nouvelle partie. En attente du serveur...")
        self.socket.sendall(json.dumps({"action": "restart"}).encode())

    def load_scores(self):
        if os.path.exists(SCORE_FILE):
            with open(SCORE_FILE, 'r') as f:
                data = json.load(f)
                self.scores = data.get("scores", self.scores)
                self.history = data.get("history", [])

    def save_scores(self):
        with open(SCORE_FILE, 'w') as f:
            json.dump({"scores": self.scores, "history": self.history}, f, indent=2)

   def show_history(self):
    history_window = tk.Toplevel()
    tk.Label(history_window, text=f"Historique complet ({len(self.history)} parties)").pack()
    
    for i, match in enumerate(self.history, 1):
        frame = tk.Frame(history_window)
        frame.pack(pady=5, padx=10, anchor='w')
        
        tk.Label(frame, text=f"Partie {i} - {match['date'][:16]}").grid(row=0, column=0, sticky='w')
        tk.Label(frame, text=match['result']).grid(row=1, column=0, sticky='w')
        
        # Affichage miniature du plateau
        mini_board = tk.Frame(frame)
        mini_board.grid(row=0, column=1, rowspan=2, padx=10)
        for pos in range(9):
            tk.Label(mini_board, text=match['board'][pos], width=2, border=1).grid(row=pos//3, column=pos%3)

if __name__ == "__main__":
    use_ai_input = input("Activer l'IA ? (o/n) : ").lower()
    game = ClientGame(use_ai=(use_ai_input == 'o'))
    game.connect()
