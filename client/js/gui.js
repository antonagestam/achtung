(() => {
    "use strict";
    let game_wrapper = $('.game');
    let settings = $('form').first();

    $('.btn-start-game').on('click', (e) => {
        e.preventDefault();

        // hide gui and show canvas
        game_wrapper.show();
        settings.hide();

        // populate an object literal with data from form
        let options = settings
            .serializeArray()
            .reduce((a, i) => {
                a[i.name] = i.value;
                return a;
            }, {});
        start_game(options);
    });

    // display values for range inputs
    $('input').on('input', (e) => {
        let name = e.target.getAttribute('name');
        let value_element = $('.value[data-for="' + name + '"]');
        value_element.text(e.target.value);
    });

})();
