import mysql.connector
from datetime import datetime

class Database:
    def __init__(self):
        self.conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="", 
            database="matchmaking_game"
        )
        self.cursor = self.conn.cursor(dictionary=True)

    def get_or_create_player(self, pseudo):
        self.cursor.execute("SELECT id FROM players WHERE pseudo = %s", (pseudo,))
        result = self.cursor.fetchone()
        if result:
            return result["id"]
        self.cursor.execute("INSERT INTO players (pseudo) VALUES (%s)", (pseudo,))
        self.conn.commit()
        return self.cursor.lastrowid

    def save_match(self, player1_id, player2_id, winner_id, board, result, duration):
        self.cursor.execute("""
            INSERT INTO matches (player1_id, player2_id, winner_id, board, result, duration)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (player1_id, player2_id, winner_id, board, result, duration))
        self.conn.commit()
