// js/views/VistaDetallesComic.js

/**
 * @fileoverview Define la vista Marionette para mostrar los detalles de un cómic.
 * Permite ver la descripción, imagen y añadir/quitar de favoritos.
 * @module views/VistaDetallesComic
 */

/**
 * @class
 * @extends Marionette.View
 * @property {string} tagName - La etiqueta HTML para el elemento raíz de la vista.
 * @property {function} template - La plantilla Underscore para renderizar los detalles del cómic.
 * @property {object} events - Define los manejadores de eventos.
 * @property {Backbone.Model} model - El modelo del cómic a mostrar.
 * @property {function} getUserId - Función para obtener el ID de usuario.
 * @property {Backbone.Collection} favoritesCollection - La colección de Favoritos.
 *
 * @method initialize - Inicializa la vista con el modelo y colecciones necesarias.
 * @method templateContext - Proporciona datos adicionales a la plantilla.
 * @method onAttach - Se ejecuta cuando la vista es adjuntada al DOM.
 * @method onBackClick - Maneja el clic en el botón "Cerrar Detalles".
 * @method onAddFavoriteClick - Maneja el clic en el botón "Marcar como Favorito".
 * @method onRemoveFavoriteClick - Maneja el clic en el botón "Eliminar de Favoritos".
 * @method updateFavoriteButton - Actualiza el estado del botón de favoritos.
 */
const VistaDetallesComic = Marionette.View.extend({
    tagName: 'div',
    className: 'comic-detail-card bg-white p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center', // Clases de Tailwind para el diseño.

    template: _.template(`
        <div class="md:w-1/3 w-full flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <img src="<%= thumbnail %>" alt="<%= title %>"
                 class="w-full h-auto object-cover rounded-lg shadow-lg"
                 onerror="this.onerror=null; this.src='https://placehold.co/200x300/cccccc/333333?text=No+Image';">
        </div>
        <div class="md:w-2/3 w-full">
            <h2 class="text-3xl font-bold text-gray-900 mb-3"><%= title %></h2>
            <p class="text-gray-700 leading-relaxed mb-6">
                <%= description ? description : 'No hay descripción disponible para este cómic.' %>
            </p>
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button id="backToListBtn"
                        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75">
                    Cerrar Detalles
                </button>
                <% if (isLoggedIn) { %>
                    <button id="addFavoriteBtn"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 <%= isFavorite ? 'hidden' : '' %>">
                        Marcar como Favorito
                    </button>
                    <button id="removeFavoriteBtn"
                            class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 <%= isFavorite ? '' : 'hidden' %>">
                        Eliminar de Favoritos
                    </button>
                <% } %>
            </div>
        </div>
    `),

    events: {
        'click #backToListBtn': 'onBackClick',
        'click #addFavoriteBtn': 'onAddFavoriteClick',
        'click #removeFavoriteBtn': 'onRemoveFavoriteClick'
    },

    /**
     * Constructor de la vista de detalles del cómic.
     * @param {object} options - Opciones, incluyendo el modelo de cómic, la función para obtener el ID de usuario y la colección de favoritos.
     */
    initialize: function(options) {
        if (!options || !options.model || !options.getUserId || !options.favoritesCollection) {
            console.error('VistaDetallesComic: Se requieren model, getUserId y favoritesCollection.');
            return;
        }
        this.model = options.model; // Modelo del cómic a mostrar.
        this.getUserId = options.getUserId; // Función para obtener el ID de usuario actual.
        this.favoritesCollection = options.favoritesCollection; // Colección de Favoritos.

        // Escuchar cambios en la colección de favoritos para actualizar el estado del botón.
        this.listenTo(this.favoritesCollection, 'add remove reset', this.updateFavoriteButton);

        // Determinar si el usuario está logueado para mostrar/ocultar los botones de favoritos.
        this.isLoggedIn = !!this.getUserId();
        // Determinar si el cómic actual ya es un favorito.
        this.isFavorite = this.favoritesCollection.findWhere({
            comicId: this.model.get('id'), // ID del cómic de Marvel
            userId: this.getUserId()
        }) ? true : false;
        this.favoriteModelId = this.isFavorite ? this.favoritesCollection.findWhere({
            comicId: this.model.get('id'),
            userId: this.getUserId()
        }).id : null;

        console.log('VistaDetallesComic inicializada para:', this.model.get('title'));
    },

    /**
     * Proporciona datos adicionales a la plantilla.
     * @returns {object} Un objeto con los atributos del modelo, estado de login y si es favorito.
     */
    templateContext: function() {
        const thumbnailUrl = this.model.get('thumbnail') ?
            `${this.model.get('thumbnail').path}.${this.model.get('thumbnail').extension}` :
            'https://placehold.co/200x300/cccccc/333333?text=No+Image'; // Placeholder si no hay imagen

        return {
            title: this.model.get('title'),
            description: this.model.get('description'),
            thumbnail: thumbnailUrl,
            isLoggedIn: this.isLoggedIn, // Pasa el estado de login a la plantilla
            isFavorite: this.isFavorite // Pasa el estado de favorito a la plantilla
        };
    },

    /**
     * Se ejecuta cuando la vista es adjuntada al DOM.
     * Es un buen lugar para cualquier lógica que dependa del DOM ya presente.
     */
    onAttach: function() {
        this.updateFavoriteButton(); // Asegura que el botón se muestre correctamente al adjuntarse.
    },

    /**
     * Maneja el clic en el botón "Cerrar Detalles".
     * Dispara un evento 'hide:details' para que la vista global vuelva a la lista.
     */
    onBackClick: function() {
        console.log('Botón "Cerrar Detalles" clicado.');
        this.triggerMethod('hide:details');
    },

    /**
     * Maneja el clic en el botón "Marcar como Favorito".
     * Llama al método para añadir el cómic a la colección de favoritos.
     */
    onAddFavoriteClick: function() {
        console.log('Botón "Marcar como Favorito" clicado.');
        const comicData = {
            comicId: this.model.get('id'), // El ID de Marvel del cómic
            title: this.model.get('title'),
            // Asegurarse de enviar la URL completa de la miniatura
            thumbnail: this.model.get('thumbnail') ? `${this.model.get('thumbnail').path}.${this.model.get('thumbnail').extension}` : '',
            description: this.model.get('description')
        };
        this.triggerMethod('add:favorite', comicData); // Dispara el evento para que VistaGlobal lo maneje.
    },

    /**
     * Maneja el clic en el botón "Eliminar de Favoritos".
     * Llama al método para eliminar el cómic de la colección de favoritos.
     */
    onRemoveFavoriteClick: function() {
        console.log('Botón "Eliminar de Favoritos" clicado.');
        if (this.favoriteModelId) {
            this.triggerMethod('remove:favorite', this.favoriteModelId); // Dispara el evento para que VistaGlobal lo maneje.
        } else {
            window.showModalMessage('Este cómic no está actualmente en tus favoritos para eliminar.');
        }
    },

    /**
     * Actualiza la visibilidad de los botones "Marcar como Favorito" y "Eliminar de Favoritos".
     * Se llama cuando cambia la colección de favoritos (añadir, eliminar, resetear).
     */
    updateFavoriteButton: function() {
        const currentUserId = this.getUserId();
        if (!currentUserId) {
            // Si no hay usuario logueado, ocultar ambos botones.
            this.$('#addFavoriteBtn').addClass('hidden');
            this.$('#removeFavoriteBtn').addClass('hidden');
            this.isLoggedIn = false;
            this.isFavorite = false;
            return;
        }

        this.isLoggedIn = true;
        // Re-evaluar si el cómic es favorito con el ID del cómic de Marvel
        const favorite = this.favoritesCollection.findWhere({
            comicId: this.model.get('id'),
            userId: currentUserId
        });

        this.isFavorite = !!favorite;
        this.favoriteModelId = favorite ? favorite.id : null;

        if (this.isFavorite) {
            this.$('#addFavoriteBtn').addClass('hidden');
            this.$('#removeFavoriteBtn').removeClass('hidden');
        } else {
            this.$('#addFavoriteBtn').removeClass('hidden');
            this.$('#removeFavoriteBtn').addClass('hidden');
        }
    }
});
