/**
 * @fileoverview 
 * @module models/Favorito
 */

/**
 * @class
 * @extends Backbone.Model
 * @property {object} defaults
 * @property {string} defaults.marvelId 
 * @property {string} defaults.title 
 * @property {string} defaults.description 
 * @property {string} defaults.thumbnail
 * @property {string} defaults.userId 
 */
const Favorito = Backbone.Model.extend({
    defaults: {
        marvelId: null,
        title: 'Título Desconocido',
        description: 'Sin descripción disponible.',
        thumbnail: 'https://placehold.co/150x225/e0e0e0/ffffff?text=No+Image',
        userId: null
    },
    idAttribute: 'id'
});