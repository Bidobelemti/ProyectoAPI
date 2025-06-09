const Usuario = Backbone.Model.extend({
    defaults: {
        username: '',
        password: '',
        loggedIn: false
    },

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
    validate: function (attrs) {
        if (!attrs.comicId) {
            return 'Se requiere un ID de cómic para un favorito.';
        }
        if (!attrs.userId) {
            return 'Se requiere un ID de usuario para un favorito.';
        }
    },

    logout: function () {
        this.set(this.defaults);
        this.trigger('sync', this, null, { success: true });
    }
});