
const FavoritosCollectionView = Marionette.CollectionView.extend({
    tagName: 'div',
    className: 'flex flex-wrap -mx-2 justify-center', // Clases de Tailwind para el diseño de cuadrícula.

    childView: Marionette.View.extend({
        tagName: 'div',
        className: 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2',
        template: _.template(`
            <div class="comic-card p-4 rounded-lg shadow-md flex flex-col items-center text-center">
                <img src="<%= thumbnail %>" alt="<%= title %>" class="w-36 h-54 object-cover rounded mb-3 shadow-sm">
                <h2 class="text-lg font-semibold mb-1"><%= title %></h2>
                <p class="text-sm text-gray-700 text-ellipsis overflow-hidden h-20"><%= description %></p>
                <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-3 remove-favorite-btn" data-id="<%= id %>">
                    Eliminar
                </button>
            </div>
        `),
        // Eventos para el botón de eliminar.
        events: {
            'click .remove-favorite-btn': 'onRemoveFavoriteClick'
        },
        onRemoveFavoriteClick: function(e) {
            e.preventDefault();
            const favoriteDocId = this.model.get('id'); // El ID de Firestore del documento favorito
            console.log('Eliminar favorito clicado para doc ID:', favoriteDocId);
            // Dispara un evento para la vista global/colección, pasando el ID del documento de Firestore.
            this.triggerMethod('remove:favorite', favoriteDocId);
        }
    }),

    emptyView: Marionette.View.extend({
        template: _.template('<p class="text-center text-gray-500 w-full">Aún no tienes cómics favoritos. ¡Añade algunos!</p>')
    }),


    childViewEvents: {
        'remove:favorite': 'onChildRemoveFavorite' // Escucha el evento de eliminación desde el ítem.
    },

    initialize: function(options) {
        console.log('FavoritosCollectionView inicializada.');

    },

    onChildRemoveFavorite: function(child, favoriteDocId) {
        console.log('Evento remove:favorite recibido en FavoritosCollectionView para doc ID:', favoriteDocId);
        // Pasa el evento a la vista global para que maneje la lógica de eliminación en Firestore.
        this.triggerMethod('remove:favorite', favoriteDocId);
    }
});