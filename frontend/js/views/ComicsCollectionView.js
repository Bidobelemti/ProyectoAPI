
/**
 * @fileoverview 
 * @module views/ComicsCollectionView
 */

/**
 * @class
 * @extends Marionette.CollectionView
 * @property {string} tagName 
 * @property {string} className 
 * @property {ComicView} childView 
 * @property {Marionette.View} emptyView 
 *
 * @method initialize 
 * @method onBeforeRender 
 * @method onRender 
 */
const ComicsCollectionView = Marionette.CollectionView.extend({
    tagName: 'div',
    className: 'flex flex-wrap -mx-2 justify-center',

    childView: ComicView,


    emptyView: Marionette.View.extend({
        template: _.template('<p class="text-center text-gray-500 w-full">No se encontraron cómics con ese título.</p>')
    }),


    initialize: function () {
        console.log('ComicsCollectionView inicializada.');
    },

    onBeforeRender: function () {
        console.log('ComicsCollectionView a punto de renderizarse.');
    },


    onRender: function () {
        console.log('ComicsCollectionView renderizada.');
    }
});
