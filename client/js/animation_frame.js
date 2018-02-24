"use strict";

let animation_frame = () => {
    /*
    https://esdiscuss.org/topic/promises-async-functions-and-requestanimationframe-together
     */
    let resolve = null;
    const promise = new Promise((r) => resolve = r);
    window.requestAnimationFrame(resolve);
    return promise;
};
