"use strict";

function* pixels_in_head(ctx, a, b, r, direction) {
    /*
    Yields all pixel values as an array of [R, G, B, A] from the given
    context that are within the circle that has a center of x, y = a, b and
    a radius of r.
     */
    for (let [x, y] of positions_in_head(a, b, r, direction)) {
        yield ctx.getImageData(x, y, 1, 1);
    }
}

let Worm = function (x, y, direction, color, keys) {
    let speed = .14;
    let turn_speed = .0025;
    let size = 4;
    let jump_length = 12;
    let dead = false;
    this.x = x;
    this.y = y;
    this.direction = direction;
    let in_jump = false;
    let jump_count = 0;
    let last_paint_time;

    let get_x = () => Math.round(this.x);
    let get_y = () => Math.round(this.y);

    let die = () => {
        speed = 0;
        dead = true;
    };

    let check_history = (ctx) => {
        let x = get_x();
        let y = get_y();

        for (let pixel of pixels_in_head(ctx, x, y, size, direction)) {
            if (pixel.data[3] === 255) {
                console.log(x, ',', y, ':', pixel.data);
                die();
                break;
            }
        }
    };

    this.maybe_start_jump = () => {
        if (Math.random() > 0.005) return;
        in_jump = true;
        jump_count = 0;
    };

    this.jump = () => {
        jump_count += 1;
        if (jump_count > jump_length)
            in_jump = false;
    };

    this.travel = (history_ctx) => {
        // don't move if we're dead
        if (dead) return;

        if (last_paint_time === undefined)
            last_paint_time = performance.now();

        // if we're in a jump, count the number of loops, otherwise check
        // the position against history for collisions
        if (!in_jump) check_history(history_ctx);
        else this.jump();

        // get time delta from previous frame
        let paint_time = performance.now();
        let dt = paint_time - last_paint_time;
        last_paint_time = paint_time;

        // turn, e.g. update direction
        if (get_key_state(keys.left))
            this.direction = normalize_direction(
                this.direction - dt * turn_speed);
        else if (get_key_state(keys.right))
            this.direction = normalize_direction(
                this.direction + dt * turn_speed);

        // set new position
        this.x += dt * speed * Math.cos(this.direction);
        this.y += dt * speed * Math.sin(this.direction);
    };

    this.paint_tail = (ctx) => {
        // if we're in a jump we do not paint the tail
        if (in_jump) return;

        ctx.save();
        //ctx.beginPath();
        ctx.fillStyle = color;
        //ctx.arc(this.x, this.y, size, 0, Math.PI * 2, true);
        //ctx.fill();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction + Math.PI/2);

        ctx.fillRect(-size, size, 2 * size, size);
        ctx.restore();
    };

    this.paint_head = (ctx) => {
        // paint a filled circular disc at the current position
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#fff';//color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction + Math.PI/2);
        ctx.arc(0, 0, size, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    };
};

(() => {
    let history_layer = document.getElementById('history_layer');
    let history_ctx = history_layer.getContext('2d');

    let position_layer = document.getElementById('position_layer');
    let position_ctx = position_layer.getContext('2d');

    let lr = {'left': 'ArrowLeft', 'right': 'ArrowRight'};
    let zx = {'left': 'z', 'right': 'x'};
    let nm = {'left': 'n', 'right': 'm'};

    let worms = [
        new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#ff5600', lr),
        /*new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#0f8', zx),
        new Worm(
            random_within(200, 600), // initial x
            random_within(200, 400), // initial y
            random_direction(), // initial direction
            '#47f', nm),*/
    ];

    let loop = () => {
        // clear position layer
        position_ctx.clearRect(
            0, 0, position_layer.width, position_layer.height);

        worms.forEach((worm) => {
            worm.maybe_start_jump();
            worm.travel(history_ctx);
            worm.paint_tail(history_ctx);
            worm.paint_head(position_ctx);
        });
        window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
})();