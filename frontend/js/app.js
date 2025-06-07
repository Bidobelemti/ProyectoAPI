
/**
 * @fileoverview 
 * @module app
 */

/**
 * @class
 * @extends Marionette.Application
 * @property {string} region 
 *
 * @method onStart 
 */
const App = Marionette.Application.extend({
    region: '#app-region',

    onStart: function () {
        console.log('Aplicación Marionette iniciada.');

        const comics = new Comics();

        const view = new ComicsCollectionView({
            collection: comics
        });

        this.showView(view);

        document.getElementById('searchBtn').addEventListener('click', () => {
            const title = document.getElementById('comicInput').value;

            if (title.trim() !== '') {
                comics.fetchByTitle(title);
            } else {
                document.getElementById('messages').innerHTML = '<p class="text-orange-500">Por favor, introduce un título para buscar.</p>';
                comics.reset();
            }
        });

        console.log('Marionette objeto:', Marionette);
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const myApp = new App();
    myApp.start();
});
