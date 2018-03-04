import asyncio
import queue
import uuid
import random

waiting_rooms = queue.Queue()
min_players = 1


class Room:
    def __init__(self):
        self.players = []
        self.started = False
        self.id = uuid.uuid4().hex
        self.free_colors = ['#ff0000', '#00ff00', '#0000ff']
        random.shuffle(self.free_colors)

    async def wait_start(self):
        while not self.started:
            await asyncio.sleep(.1)

    def start(self):
        self.started = True

    def join(self, player):
        self.players.append(player)
        player.give_color(self.free_colors.pop())

    @classmethod
    def get(cls, player):
        """
        Find a room for a player by first checking if there are rooms waiting
        for players, otherwise creates a new one.
        """
        try:
            room = waiting_rooms.get_nowait()
        except queue.Empty:
            room = cls()

        room.join(player)

        if len(room.players) == min_players:
            room.start()
        else:
            waiting_rooms.put(room)
        return room

    def serialize(self):
        return {
            'id': self.id,
            'players': {
                p.id: p.serialize() for p in self.players
            }
        }

    def player_positions(self):
        return {
            p.id: {
                'x': p.x,
                'y': p.y,
                'direction': p.direction,
            } for p in self.players
        }
