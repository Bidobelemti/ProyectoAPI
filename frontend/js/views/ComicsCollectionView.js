// js/views/ComicsCollectionView.js

/**
 * @fileoverview Define la vista de colección Marionette para mostrar una lista de cómics.
 * Utiliza ComicView para renderizar cada elemento individual del cómic.
 * @module views/ComicsCollectionView
 */

/**
 * @class
 * @extends Marionette.CollectionView
 * @property {string} tagName - La etiqueta HTML para el elemento raíz de la vista de colección.
 * @property {string} className - Las clases CSS para el elemento raíz.
 * @property {ComicView} childView - La vista que se utilizará para renderizar cada modelo en la colección.
 * @property {function} emptyView - La vista que se muestra cuando la colección está vacía.
 * @property {object} childViewEvents - Eventos de las vistas hijas a los que esta vista debe reaccionar.
 *
 * @method initialize - Inicializa la vista de colección.
 */
const ComicsCollectionView = Marionette.CollectionView.extend({
    tagName: 'div', // Cambiado de 'ul' a 'div' para usar el grid de Tailwind
    className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4', // Clases de Tailwind para un grid responsivo

    childView: ComicView, // La vista que se usará para cada cómic.

    // Vista que se mostrará cuando la colección de cómics esté vacía.
    emptyView: Marionette.View.extend({
        template: _.template(`
            <div class="col-span-full text-center p-8 bg-gray-100 rounded-lg shadow-inner">
                <p class="text-gray-600 text-lg">No se encontraron cómics. Intenta otra búsqueda.</p>
            </div>
        `)
    }),

    /**
     * Escucha eventos disparados por las vistas hijas (ComicView).
     * El primer parámetro de la función de callback es la vista hija que disparó el evento.
     */
    childViewEvents: {
        'show:details': 'onChildShowDetails' // Cuando un ComicView dispara 'show:details'
    },

    /**
     * Inicializa la vista de colección de cómics.
     * @param {object} options - Opciones, incluyendo la colección de cómics.
     */
    initialize: function(options) {
        if (!options || !options.collection) {
            console.error('ComicsCollectionView: Se requiere una colección para inicializar.');
            return;
        }
        this.collection = options.collection; // La colección de cómics.
        console.log('ComicsCollectionView inicializada.');
    },

    /**
     * Maneja el evento 'show:details' disparado por una vista hija (ComicView).
     * Propaga el evento y el modelo del cómic a la vista superior (VistaGlobal).
     * @param {Marionette.View} childView - La vista hija que disparó el evento.
     * @param {Backbone.Model} comicModel - El modelo del cómic cuyos detalles se quieren mostrar.
     */
    onChildShowDetails: function(childView, comicModel) {
        console.log('Evento show:details recibido en ComicsCollectionView. Propagando a VistaGlobal.');
        this.triggerMethod('show:details', comicModel); // Propagar el evento hacia arriba.
    }
});
