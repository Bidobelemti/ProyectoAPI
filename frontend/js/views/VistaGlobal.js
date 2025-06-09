
const VistaGlobal = Marionette.View.extend({
    el: '.container',
    template: false,
    template: _.template(`
        <div id="header-region" ></div>
        <div id="search-region" ></div>
        <div id="app-region"></div>

        `),
    regions: {
        headerRegion: '#header-region',       // Para el formulario de login/estado del usuario
        searchFormRegion: '#search-region',   // Para el formulario de búsqueda de cómics
        listadoRegion: '#app-region'          // Para el listado de cómics o detalles de un cómic
    },


    childEvents: {
        'login:success': 'onChildLoginSuccess',        // Desde VistaFormLogin (login exitoso)
        'logout:success': 'onChildLogoutSuccess',      // Desde VistaFormLogin (logout exitoso)
        'show:favorites': 'onChildShowFavorites',      // Desde VistaFormLogin (mostrar mis cómics)
        'hide:favorites': 'onChildHideFavorites',      // Desde VistaFormLogin (ocultar mis cómics) - No implementado en doc, pero buena práctica
        'completed:search': 'onChildCompletedSearch',  // Desde VistaBuscarComics (búsqueda completada)
        'show:details': 'onChildShowDetails',          // Desde ComicView (ver detalles de un cómic)
        'hide:details': 'onChildHideDetails',          // Desde VistaDetallesComic (cerrar detalles)
        'add:favorite': 'onChildAddFavorite',          // Desde VistaDetallesComic (añadir a favoritos)
        'remove:favorite': 'onChildRemoveFavorite'     // Desde FavoritosCollectionView (eliminar favorito)
    },

    initialize: function (options) {
        this.db = options.db;
        this.auth = options.auth;
        this.getUserId = options.getUserId;
        this.appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        this.comicsCollection = new Comics();

        this.favoritesCollection = new Favoritos([], {
            db: this.db,
            getUserId: this.getUserId,
            appId: this.appId
        });

        this.currentComicsListView = null;

        console.log('VistaGlobal inicializada.');
    },

    onRender: function () {
        console.log('VistaGlobal renderizada. Mostrando vistas hijas iniciales...');

        this.showChildView('headerRegion', new VistaFormLogin());
        this.showChildView('searchFormRegion', new VistaBuscarComics({ collection: this.comicsCollection }));
        const comicsListView = new ComicsCollectionView({ collection: this.comicsCollection });

        this.showChildView('listadoRegion', comicsListView);

    },

    onChildCompletedSearch: function (child, col) {
        console.log('Evento completed:search recibido en VistaGlobal.');
        if (this.currentComicsListView) {
            this.currentComicsListView.collection = col;
            this.currentComicsListView.render();
            this.showChildView('listadoRegion', this.currentComicsListView);
        } else {
            this.currentComicsListView = new ComicsCollectionView({ collection: col });
            this.showChildView('listadoRegion', this.currentComicsListView);
        }
    },

    onChildShowDetails: function (child, model) {
        console.log('Evento show:details recibido en VistaGlobal para:', model.get('title'));


        this.currentComicsListView = this.getRegion('listadoRegion').currentView;

        const detailView = new VistaDetallesComic({
            model: model,
            getUserId: this.getUserId,
            favoritesCollection: this.favoritesCollection
        });

        this.showChildView('listadoRegion', detailView, { preventDestroy: true });
    },


    onChildHideDetails: function () {
        console.log('Evento hide:details recibido en VistaGlobal. Volviendo a la lista.');
        if (this.currentComicsListView) {
            this.showChildView('listadoRegion', this.currentComicsListView);
        }
    },


    onChildLoginSuccess: function (child, userModel) {
        console.log('Login exitoso en VistaGlobal. Usuario:', userModel.get('username'));
        window.appState.currentUserModel = userModel; // Almacena el modelo de usuario
        const userId = this.getUserId(); // Obtiene el userId de Firebase
        if (userId) {
            this.favoritesCollection.fetchFavorites(userId);
            if (this.currentComicsListView && this.getRegion('listadoRegion').currentView !== this.currentComicsListView) {
                this.showChildView('listadoRegion', this.currentComicsListView);
            }
            document.getElementById('messages').innerHTML = `<p class="text-green-600">¡Bienvenido, ${userModel.get('username')}!</p>`;
        } else {
            document.getElementById('messages').innerHTML = `<p class="text-orange-500">Login simulado exitoso, pero Firebase userId no disponible.</p>`;
        }
    },

    onChildLogoutSuccess: function () {
        console.log('Logout exitoso en VistaGlobal.');
        window.appState.currentUserModel = null;
        this.favoritesCollection.reset([]);
        this.favoritesCollection.stopListening();
        document.getElementById('messages').innerHTML = `<p class="text-gray-700">Has cerrado sesión.</p>`;
        this.getRegion('headerRegion').show(new VistaFormLogin());
    },

    onChildShowFavorites: function () {
        console.log('Evento show:favorites recibido en VistaGlobal. Mostrando favoritos.');
        const userId = this.getUserId();
        if (!userId) {
            window.showModalMessage('Debes iniciar sesión para ver tus favoritos.');
            return;
        }

        const favoritesListView = new FavoritosCollectionView({
            collection: this.favoritesCollection,
            getUserId: this.getUserId,
            appId: this.appId
        });
        this.showChildView('listadoRegion', favoritesListView);
        document.getElementById('messages').innerHTML = `<p class="text-blue-600">Mostrando tus cómics favoritos.</p>`;
    },

    onChildAddFavorite: async function (child, comicData) {
        console.log('Evento add:favorite recibido en VistaGlobal para:', comicData.title);
        try {
            await this.favoritesCollection.addFavoriteToFirestore(comicData);
        } catch (e) {
            console.error('Error al añadir favorito en VistaGlobal:', e);
        }
    },

    onChildRemoveFavorite: async function (child, favoriteDocId) {
        console.log('Evento remove:favorite recibido en VistaGlobal para doc ID:', favoriteDocId);
        try {
            await this.favoritesCollection.removeFavoriteFromFirestore(favoriteDocId);
        } catch (e) {
            console.error('Error al eliminar favorito en VistaGlobal:', e);
        }
    }
});