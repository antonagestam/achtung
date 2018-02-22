import uuid


class Player:
    def __init__(self):
        self.id = uuid.uuid4().hex
        self.color = None

    def give_color(self, color):
        self.color = color

    def serialize(self):
        return {
            'id': self.id,
            'color': self.color,
        }
