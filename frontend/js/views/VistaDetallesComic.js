
const VistaDetallesComic = Marionette.View.extend({
    // El elemento raíz de esta vista.
    tagName: 'div',
    className: 'p-6 bg-white rounded-lg shadow-xl flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6',

    // Plantilla Underscore para mostrar los detalles del cómic.
    template: _.template(`
        <div class="md:w-1/3 flex-shrink-0">
            <img src="<%= thumbnail %>" alt="<%= title %>" class="w-full h-auto object-cover rounded-lg shadow-lg">
        </div>
        <div class="md:w-2/3 flex flex-col space-y-4">
            <h2 class="text-3xl font-bold text-gray-900"><%= title %></h2>
            <p class="text-gray-700 leading-relaxed text-base"><%= description %></p>
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4">
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75" id="addFavoriteBtn">
                    Marcar como Favorito
                </button>
                <button class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75" id="closeDetailsBtn">
                    Cerrar Detalles
                </button>
            </div>
        </div>
    `),

    events: {
        'click #closeDetailsBtn': 'onCloseClick',
        'click #addFavoriteBtn': 'onAddFavoriteClick'
    },


    initialize: function(options) {
        if (!options || !options.model || !options.getUserId || !options.favoritesCollection) {
            console.error('VistaDetallesComic: Se requieren model, getUserId y favoritesCollection para inicializar.');
            return;
        }
        this.model = options.model; // El modelo del cómic a mostrar.
        this.getUserId = options.getUserId;
        this.favoritesCollection = options.favoritesCollection;
        console.log('VistaDetallesComic inicializada para:', this.model.get('title'));
    },

    templateContext: function() {
        return this.model.toJSON(); // Pasa todos los atributos del modelo a la plantilla.
    },


    onCloseClick: function(e) {
        e.preventDefault(); // Evita el comportamiento por defecto del botón/enlace.
        console.log('Cerrar detalles clicado.');
        this.triggerMethod('hide:details'); // Dispara el evento para la vista global.
    },

    onAddFavoriteClick: function(e) {
        e.preventDefault();
        console.log('Marcar como Favorito clicado para:', this.model.get('title'));
        this.triggerMethod('add:favorite', {
            marvelId: this.model.get('id'), // El ID de Marvel del cómic
            title: this.model.get('title'),
            description: this.model.get('description'),
            thumbnail: this.model.get('thumbnail')
        });
    }
});