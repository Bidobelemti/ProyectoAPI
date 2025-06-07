/**
 * @fileoverview 
 * @module models/Usuario
 */

/**
 * @class
 * @extends Backbone.Model
 * @property {object} defaults 
 * @property {string} defaults.username 
 * @property {boolean} defaults.loggedIn 
 */
const Usuario = Backbone.Model.extend({
    defaults: {
        username: '',
        password: '',
        loggedIn: false
    },

    /**
     * @param {object} options 
     */
    login: function (options) {

        const username = this.get('username');
        const password = this.get('password');

        if (username === 'test@example.com' && password === 'password123') {
            this.set({ loggedIn: true, username: username });
            this.trigger('sync', this, null, options);
            if (options && options.success) {
                options.success(this, null, options);
            }
        } else {
            const error = { message: 'Usuario o contraseña incorrectos.' };
            this.trigger('error', this, error, options);
            if (options && options.error) {
                options.error(this, error, options);
            }
        }
    },

    logout: function () {
        this.set(this.defaults);
        this.trigger('sync', this, null, { success: true });
    }
});