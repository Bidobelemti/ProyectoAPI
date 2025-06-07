
/**
 * @fileoverview 
 * @module models/Comic
 */

/**
 * @class
 * @extends Backbone.Model
 * @property {object} defaults 
 * @property {string} defaults.title
 * @property {string} defaults.thumbnail
 * @property {string} defaults.description 
 */
const Comic = Backbone.Model.extend({
    defaults: {
        title: 'Título Desconocido',
        thumbnail: 'https://placehold.co/150x225/e0e0e0/ffffff?text=No+Image',
        description: 'Sin descripción disponible.'
    }
});
