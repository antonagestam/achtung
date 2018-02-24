"use strict";

let get_worms = (players) => {
    return players.map((p) => {
        new Worm(p.x, p.y, p.direction, p.color);
    });
};

let start_game = (worms) => {
    let history_layer = document.getElementById('history_layer');
    let history_ctx = history_layer.getContext('2d');

    let position_layer = document.getElementById('position_layer');
    let position_ctx = position_layer.getContext('2d');

    // clean up
    history_ctx.clearRect(
        0, 0, history_ctx.canvas.width, history_ctx.canvas.height);
    position_ctx.clearRect(
        0, 0, history_ctx.canvas.width, history_ctx.canvas.height);

    let started = false;
    window.setTimeout(() => started = true, 2000);

    // asynchronous game loop
    (async () => {
        let game_is_running = true;
        while (game_is_running) {
            await animation_frame();

            // clear position layer
            position_ctx.clearRect(
                0, 0, position_layer.width, position_layer.height);

            worms.forEach((worm) => {
                //worm.maybe_start_jump();
                //worm.travel(history_ctx);
                worm.paint_head(position_ctx);
                if (started) worm.paint_tail(history_ctx);
            });

            // keep game running unless all worms are dead
            game_is_running = !worms.every(worm => worm.is_dead());
        }
    })();
};

(() => {
    let ws = new WSDispatcher(
        'ws://' + document.domain + ':' + location.port + '/join');
    let player_id = null;
    let players = null;

    ws.bind('welcome', (data) => {
        console.log(data);
        player_id = data.player.id;
    });

    ws.bind('start', (data) => {
        console.log('game is starting');
        players = data.room.players;
        start_game(get_worms(players));
    });

    ws.bind('position_update', (data) => {
        for (let [player_id, pos] of Object.entries(data)) {
            players[player_id].x = pos.x;
            players[player_id].y = pos.y;
            players[player_id].direction = pos.direction;
        }
    });

    // send keyevents to server
    window.addEventListener('keyup', (e) => ws.send('keyup', {'key': e.key}));
    window.addEventListener('keydown', (e) => ws.send('keydown', {'key': e.key}));
})();
