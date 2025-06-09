window.appState = {
    db: null,
    auth: null,
    userId: null,
    isReady: false, // Indica si Firebase y la autenticación inicial están listos
    currentUserModel: null // Para almacenar el modelo de usuario logueado (simulado)
};
window.showModalMessage = function (message) {
    const modalTemplate = _.template(document.getElementById('modal-message-template').innerHTML);
    const modalHtml = modalTemplate({ message: message });
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalHtml;

    modalContainer.querySelector('.modal-close-btn').addEventListener('click', () => {
        modalContainer.innerHTML = '';
    });
};

const App = Marionette.Application.extend({

    onStart: function() {
        console.log('Aplicación Marionette iniciada.');

        window.appState.db = window.firebaseDb;
        window.appState.auth = window.firebaseAuth;
        window.appState.userId = window.currentUserId; 
        window.appState.isReady = window.isFirebaseReady;

        if (window.appState.auth) {
            window.appState.auth.onAuthStateChanged(user => {
                window.appState.userId = user ? user.uid : null;
                console.log('Estado de autenticación de Firebase cambiado. Nuevo userId:', window.appState.userId);
            });
        }

        const globalView = new VistaGlobal({
            db: window.appState.db,
            auth: window.appState.auth,
            getUserId: () => window.appState.userId,
            appId: typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'
        });

        globalView.render()
        //this.showView(globalView);

        console.log('Instancias de Firebase y estado de la aplicación disponibles globalmente (window.appState):', window.appState);
    }
});
