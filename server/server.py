import asyncio
import uvloop
import sanic
import ujson

from .player import Player
from .room import Room

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
app = sanic.Sanic(__name__)
loop = asyncio.get_event_loop()


app.static('/', './client')


async def publish(ws, player):
    """Receive keyevents from the WebSocket and update the player state"""
    while True:
        data = ujson.loads(await ws.recv())
        down = data['event'] == 'keydown'
        if data['data']['key'] == 'ArrowLeft':
            player.left = down
        elif data['data']['key'] == 'ArrowRight':
            player.right = down


async def subscribe(ws, room):
    """Broadcast player positions at 60 fps"""
    while True:
        msg = ujson.dumps({
            'event': 'position_update',
            'data': room.player_positions(),
        })
        await ws.send(msg)
        await asyncio.sleep(.016667)


@app.websocket('/join')
async def join(request, ws):
    """
    For every request we:
        - Create a player object
        - Assign the player to a room
        - Wait for the room to start
        - Send back a start event with player data
        - Start a publish loop and a subscribe loop
    """
    player = Player()
    room = Room.get(player)

    # send initial data about the player
    await ws.send(ujson.dumps({
        'event': 'welcome',
        'data': {'player': player.serialize(), },
    }))

    # wait for room to fill then start
    await room.wait_start()
    print(f'game is starting in room {room.id}')
    await ws.send(ujson.dumps({
        'event': 'start',
        'data': {'room': room.serialize(), },
    }))

    # start pub/sub loops
    await asyncio.gather(publish(ws, room), subscribe(ws, room))


if __name__ == '__main__':
    try:
        import sys
        port = sys.argv[1]
    except IndexError:
        port = 8000
    app.run(host="0.0.0.0", port=port, debug=True)
