"use strict";

console.log('loaded key state');

let get_key_state = (() => {
    let state = {};

    window.onkeyup = (e) =>
        window.setTimeout(() => state[e.key] = true);
    window.onkeydown = (e) =>
        window.setTimeout(() => state[e.key] = false);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
})();
