"use strict";

let animationFrame = () => {
    /*
    https://esdiscuss.org/topic/promises-async-functions-and-requestanimationframe-together
     */
    let resolve = null;
    const promise = new Promise((r) => resolve = r);
    window.requestAnimationFrame(resolve);
    return promise;
};

let start_game = (options) => {
    let history_layer = document.getElementById('history_layer');
    let history_ctx = history_layer.getContext('2d');

    let position_layer = document.getElementById('position_layer');
    let position_ctx = position_layer.getContext('2d');

    // clean up
    history_ctx.clearRect(
        0, 0, history_ctx.canvas.width, history_ctx.canvas.height);
    position_ctx.clearRect(
        0, 0, history_ctx.canvas.width, history_ctx.canvas.height);

    let lr = {'left': 'ArrowLeft', 'right': 'ArrowRight'};
    let zx = {'left': 'z', 'right': 'x'};
    let nm = {'left': 'n', 'right': 'm'};

    let worms = [
        new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#ff5600', lr, options),
        new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#0f8', zx, options),
        new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#47f', nm, options),
    ];

    let started = false;
    window.setTimeout(() => started = true, 2000);

    // asynchronous game loop
    (async () => {
        let game_is_running = true;
        while (game_is_running) {
            await animationFrame();

            // clear position layer
            position_ctx.clearRect(
                0, 0, position_layer.width, position_layer.height);

            worms.forEach((worm) => {
                worm.maybe_start_jump();
                worm.travel(history_ctx);
                worm.paint_head(position_ctx);
                if (started) worm.paint_tail(history_ctx);
            });

            // keep game running unless all worms are dead
            game_is_running = !worms.every(worm => worm.is_dead());
        }

        window.setTimeout(() => start_game(options), 3000);
    })();
};
