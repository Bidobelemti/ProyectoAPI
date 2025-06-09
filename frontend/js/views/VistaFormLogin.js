const VistaFormLogin = Marionette.View.extend({
    // El elemento raíz de esta vista.
    tagName: 'div',
    className: 'flex flex-col items-center space-y-4 w-full', // Clases de Tailwind para el diseño.

    template: _.template(`
        <% if (loggedIn) { %>
            <div >
                <p >¡Hola, <%= username %>!</p>
                <div  >
                    <button id="btnMisComics">Mis Cómics</button>
                    <button id="btnLogout">Cerrar Sesión</button>
                </div>
            </div>
        <% } else { %>
            <div >
                <h2 >Iniciar Sesión</h2>
                <input type="text" id="loginUsername" placeholder="Usuario"
                        value="test@example.com">
                <input type="password" id="loginPassword" placeholder="Contraseña"
                        value="password123">
                <button id="btnLogin">Login</button>
                <div id="loginMessage" ></div>
            </div>
        <% } %>
    `),

    events: {
        'click #btnLogin': 'onLoginClick',
        'click #btnLogout': 'onLogoutClick',
        'click #btnMisComics': 'onShowFavoritesClick'
    },


    initialize: function() {
        this.usuario = new Usuario(); 
        this.listenTo(this.usuario, 'change:loggedIn', this.render);
        this.listenTo(this.usuario, 'change:username', this.render);
        this.listenTo(this.usuario, 'sync', this.onLoginSync);
        this.listenTo(this.usuario, 'error', this.onLoginError);
        console.log('VistaFormLogin inicializada.'); // Línea de depuración.
    },


    templateContext: function() {
        return this.usuario.toJSON(); 
    },

    onLoginClick: function() {
        const username = this.$('#loginUsername').val();
        const password = this.$('#loginPassword').val();
        this.$el.find('#loginMessage').text('Iniciando sesión...'); // Usar $el.find para asegurar el scope de la vista
        this.usuario.set({ username: username, password: password });
        // Llama al método login del modelo de usuario.
        this.usuario.login();
    },

    /**
     * Callback para el evento 'sync' del modelo Usuario.
     * Se dispara cuando el login o logout es exitoso (simulado).
     */
    onLoginSync: function(model, response, options) {
        if (model.get('loggedIn')) {
            this.$el.find('#loginMessage').text(''); // Limpia el mensaje
            window.showModalMessage(`¡Bienvenido, ${model.get('username')}!`);
            // Dispara un evento para que la vista global sepa que el login fue exitoso.
            this.triggerMethod('login:success', model);
        } else {
            // Si el modelo no está logueado (ej. después de un logout)
            this.$el.find('#loginMessage').text('Sesión cerrada.');
            window.showModalMessage('Has cerrado sesión.');
            this.triggerMethod('logout:success');
        }
    },

    /**
     * Callback para el evento 'error' del modelo Usuario.
     * Se dispara cuando el login falla (simulado).
     */
    onLoginError: function(model, error, options) {
        const errorMessage = error.message || 'Error desconocido al iniciar sesión.';
        this.$el.find('#loginMessage').text(errorMessage);
        window.showModalMessage(`Error de login: ${errorMessage}`);
    },

    /**
     * Maneja el clic en el botón de logout.
     */
    onLogoutClick: function() {
        this.usuario.logout(); // Llama al método logout del modelo.
    },

    /**
     * Maneja el clic en el botón "Mis Cómics".
     * Dispara un evento para que la vista global muestre los favoritos.
     */
    onShowFavoritesClick: function() {
        this.triggerMethod('show:favorites');
    }
});