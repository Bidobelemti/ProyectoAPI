// js/views/VistaBuscarComics.js

/**
 * @fileoverview Define la vista Marionette para el formulario de búsqueda de cómics.
 * Maneja la entrada de texto y el botón de búsqueda, y dispara un evento
 * cuando la búsqueda se ha completado.
 * @module views/VistaBuscarComics
 */

/**
 * @class
 * @extends Marionette.View
 * @property {string} tagName - La etiqueta HTML para el elemento raíz de la vista.
 * @property {function} template - La plantilla Underscore para renderizar el formulario de búsqueda.
 * @property {object} events - Define los manejadores de eventos para los elementos del DOM.
 * @property {Backbone.Collection} collection - La colección de cómics asociada a esta vista.
 *
 * @method initialize - Inicializa la vista y escucha el evento 'sync' de la colección.
 * @method templateContext - Proporciona datos adicionales a la plantilla.
 * @method onSearchClick - Maneja el clic en el botón de búsqueda.
 * @method onCollectionSync - Callback para el evento 'sync' de la colección.
 */
const VistaBuscarComics = Marionette.View.extend({
    // El elemento raíz de esta vista.
    tagName: 'div',
    className: 'flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 w-full', // Clases de Tailwind para el diseño.

    // Plantilla Underscore para el formulario de búsqueda.
    // Las clases de Tailwind se incrustan directamente aquí para simplificar la depuración.
    template: _.template(`
        <input type="text" id="comicInput" placeholder="Buscar cómic por título..."
               class="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-800 mb-2 sm:mb-0 sm:mr-4">
        <button id="searchBtn"
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
            Buscar Cómics
        </button>
    `),

    // Define los eventos y sus manejadores.
    events: {
        'click #searchBtn': 'onSearchClick'
    },

    /**
     * Constructor de la vista.
     * @param {object} options - Opciones, incluyendo la colección de cómics.
     */
    initialize: function(options) {
        if (!options || !options.collection) {
            console.error('VistaBuscarComics: Se requiere una colección para inicializar.');
            return;
        }
        this.collection = options.collection; // La colección de cómics de Marvel.
        // Escucha el evento 'sync' en la colección para saber cuándo la búsqueda ha terminado.
        this.listenTo(this.collection, 'sync', this.onCollectionSync);
        console.log('VistaBuscarComics inicializada.'); // Línea de depuración.
    },

    /**
     * Proporciona datos adicionales a la plantilla.
     * En este caso, ya no pasamos clases de Tailwind dinámicamente, ya que están incrustadas.
     * @returns {object} Un objeto vacío o con datos de modelo si fuera necesario.
     */
    templateContext: function() {
        return {}; // Ya no necesitamos pasar clases de Tailwind aquí.
    },

    /**
     * Maneja el clic en el botón de búsqueda.
     * Obtiene el valor del campo de entrada y llama al método de búsqueda de la colección.
     */
    onSearchClick: function() {
        const title = this.$('#comicInput').val(); // Usa this.$ para jQuery en la vista.
        if (title.trim() !== '') {
            this.collection.fetchByTitle(title); // Llama al método de búsqueda de la colección.
        } else {
            // Si el campo de búsqueda está vacío, muestra un mensaje y limpia la colección.
            document.getElementById('messages').innerHTML = '<p class="text-orange-500">Por favor, introduce un título para buscar.</p>';
            this.collection.reset();
        }
    },

    /**
     * Callback para el evento 'sync' de la colección.
     * Se dispara cuando la colección ha terminado de sincronizarse con el servidor (la búsqueda ha terminado).
     * Dispara un evento 'completed:search' para que la vista global pueda reaccionar.
     */
    onCollectionSync: function() {
        console.log('Colección sincronizada en VistaBuscarComics. Disparando completed:search.');
        // Dispara un evento para la vista global, pasando la colección de cómics.
        this.triggerMethod('completed:search', this.collection);
    }
});
