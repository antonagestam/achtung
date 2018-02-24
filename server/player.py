import uuid
import random
import math

options = {
    'speed': .16,
    'turn_speed': .003,
    'size': 5,
}

class Player:
    def __init__(self):
        self.id = uuid.uuid4().hex
        self.color = None
        # give the player a random direction and position within the canvas
        self.x = random.randint(200, 600)
        self.y = random.randint(200, 400)
        self.direction = random.random() * math.pi * 2

    def give_color(self, color):
        self.color = color

    def serialize(self):
        return {
            'id': self.id,
            'color': self.color,
            'x': self.x,
            'y': self.y,
            'direction': self.direction,
        }
