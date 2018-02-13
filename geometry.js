"use strict";

function line_filter(direction, a, b) {
    /*
    Returns a function that takes a position x and y as input and returns
    true if the point is on the one side of the line perpendicular to the
    direction and crossing the point where the direction is pointing towards.

    direction needs to be normalized to values between 0 and 2 * PI.

    There are four cases :

    1. direction is divisible by 2 pi or equal to zero
        return true if x is to the right of the line
    2. direction is divisible by pi
        return true if x is to the left of the line
    3. 0 < direction < pi
        return true if y is below the line
    4. pi < direction < 2 * pi
        return true if y is above the line
    */

    // move the point one pixel towards the head to make a margin
    a += Math.cos(direction);
    b += Math.sin(direction);

    if (direction === 0 || direction === 2 * Math.PI)
        return (x, y) => x > a;
    if (direction % Math.PI === 0)
        return (x, y) => x < a;

    // L is a line perpendicular to the direction, crossing the
    // point (a, b)

    let d = direction + Math.PI / 2;
    let k = Math.tan(d);
    let L = (x) => k * (x - a) + b;

    if (0 < direction && direction < Math.PI)
        return (x, y) => y > L(x);
    return (x, y) => y < L(x);
}

function* positions_in_circle(a, b, r) {
    /*
    Return all integer positions that are within a circle of radius r and has a
    center in (x, y) = (a, b).

    We loop through all the values in a square surrounding the circle and yield
    if in_circle returns true.
    */
    for (let x = a - r; x <= a + r; x++)
        for (let y = b - r; y <= b + r; y++)
            if (in_circle(x, y, a, b, r)) {
                //console.log('positions_in_circle', x, y);
                yield [x, y];
            }
}

function* positions_in_head(a, b, r, direction) {
    let filter = line_filter(direction, a, b);
    for (let [x, y] of positions_in_circle(a, b, r))
        if (filter(x, y)) {
            yield [x, y];
        }
}

let normalize_direction = (d) => {
    /* Normalizes an angle in radians to values between 0 and 2 * PI */
    d = d % (2 * Math.PI);
    if (d < 0)
        d += 2 * Math.PI;
    return d;
};

let in_circle = (x, y, a, b, r) => {
    /*
    Return true if the point x, y is inside the circle that has a center in
    x, y = a, b and a radius of r.

    Formula from https://en.wikipedia.org/wiki/Disk_(mathematics)

    Edited to take a lower bound, creating a 2px wide "stroke"
    */
    let d = (x - a) ** 2 + (y - b) ** 2;
    return (r - 2) ** 2 < d && d < r ** 2;
};
