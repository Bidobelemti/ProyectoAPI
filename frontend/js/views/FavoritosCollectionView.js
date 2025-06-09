// js/views/FavoritosCollectionView.js

/**
 * @fileoverview Define la vista de colección Marionette para mostrar la lista de cómics favoritos.
 * Utiliza FavoritoItemView para renderizar cada elemento individual.
 * @module views/FavoritosCollectionView
 */

/**
 * @class
 * @extends Marionette.View
 * @property {string} tagName - La etiqueta HTML para el elemento raíz de la vista (contenedor de la colección).
 * @property {function} template - Plantilla para el contenedor de la colección (mensaje si no hay favoritos).
 * @property {string} childView - La vista que se utilizará para renderizar cada modelo en la colección.
 * @property {string} collectionEvents - Eventos de la colección a los que esta vista debe reaccionar.
 *
 * @method initialize - Inicializa la vista con la colección de favoritos.
 * @method onAttach - Se ejecuta cuando la vista se adjunta al DOM.
 * @method onCollectionReset - Maneja el evento 'reset' de la colección.
 */
const FavoritosCollectionView = Marionette.CollectionView.extend({
    tagName: 'div', // Un div que contendrá la lista de favoritos.
    className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4', // Clases de Tailwind para un grid responsivo

    // Esta plantilla solo se usará si la colección está vacía.
    emptyView: Marionette.View.extend({
        template: _.template(`
            <div class="col-span-full text-center p-8 bg-gray-100 rounded-lg shadow-inner">
                <p class="text-gray-600 text-lg">Aún no tienes cómics favoritos. ¡Añade algunos!</p>
            </div>
        `)
    }),

    childView: Marionette.View.extend({
        tagName: 'div',
        className: 'comic-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform transition duration-200 hover:scale-105', // Clases de Tailwind para la tarjeta de cómic

        template: _.template(`
            <img src="<%= thumbnail %>" alt="<%= title %>"
                 class="w-full h-48 object-cover"
                 onerror="this.onerror=null; this.src='https://placehold.co/200x300/cccccc/333333?text=No+Image';">
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="font-bold text-lg mb-2 text-gray-800"><%= title %></h3>
                <p class="text-gray-600 text-sm overflow-hidden text-ellipsis h-12 mb-4"><%= description %></p>
                <div class="mt-auto flex justify-end">
                    <button class="remove-favorite-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150">
                        Eliminar
                    </button>
                </div>
            </div>
        `),

        events: {
            'click .remove-favorite-btn': 'onRemoveFavoriteClick'
        },

        initialize: function(options) {
            this.getUserId = options.getUserId; // Recibe la función getUserId de la colección padre.
            this.appId = options.appId; // Recibe el appId.
            console.log('FavoritoItemView inicializada para:', this.model.get('title'));
        },

        /**
         * Proporciona datos adicionales a la plantilla.
         * Asegura que la URL de la miniatura sea correcta.
         * @returns {object} Un objeto con los atributos del modelo, con la URL completa de la miniatura.
         */
        templateContext: function() {
            const descriptionSnippet = this.model.get('description') ?
                this.model.get('description').substring(0, 100) + (this.model.get('description').length > 100 ? '...' : '') :
                'No hay descripción disponible.';

            return {
                title: this.model.get('title'),
                thumbnail: this.model.get('thumbnail') || 'https://placehold.co/200x300/cccccc/333333?text=No+Image',
                description: descriptionSnippet
            };
        },

        onRemoveFavoriteClick: function() {
            console.log('Botón "Eliminar" clicado para favorito:', this.model.get('title'));
            // Dispara un evento 'remove:favorite' que la VistaGlobal escuchará.
            // Pasa el ID del documento de Firestore del favorito.
            this.triggerMethod('remove:favorite', this.model.id);
        }
    }),

    /**
     * Constructor de la colección de vistas de favoritos.
     * @param {object} options - Opciones, incluyendo la colección de Favoritos.
     */
    initialize: function(options) {
        if (!options || !options.collection) {
            console.error('FavoritosCollectionView: Se requiere una colección para inicializar.');
            return;
        }
        this.collection = options.collection;
        this.getUserId = options.getUserId; // Pasar a las vistas hijas
        this.appId = options.appId; // Pasar a las vistas hijas
        console.log('FavoritosCollectionView inicializada.');
    },

    // Este método se usa para pasar opciones a las childViews.
    childViewOptions: function(model, index) {
        return {
            getUserId: this.getUserId,
            appId: this.appId
        };
    },

    onCollectionReset: function() {
        this.render(); // Re-renderiza la vista para mostrar la nueva lista.
        console.log('Colección Favoritos reseteada. Re-renderizando FavoritosCollectionView.');
    }
});
