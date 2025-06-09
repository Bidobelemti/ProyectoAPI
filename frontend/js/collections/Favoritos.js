/**
 * @fileoverview 
 * @module collections/Favoritos
 */

/**
 * @class
 * @extends Backbone.Collection
 * @property {Favorito} model 
 * @property {object} firebaseDb 
 * @property {string} userId 
 * @property {string} appId 
 * @property {function} unsubscribe 
 *
 * @constructor
 * @param {Array<object>} models -
 * @param {object} options 
 *
 * @method fetchFavorites 
 * @method addFavoriteToFirestore 
 * @method removeFavoriteFromFirestore 
 * @method parse 
 */
const Favoritos = Backbone.Collection.extend({
    model: Favorito,

    /**
     * @param {Array<object>} models 
     * @param {object} options 
     */
    initialize: function(models, options) {
        if (!options || !options.db || !options.getUserId || !options.appId) {
            console.error('Favoritos Collection: Se requieren db, getUserId y appId para inicializar.');
            return;
        }
        this.firebaseDb = options.db;
        this.getUserId = options.getUserId; 
        this.appId = options.appId;
        this.unsubscribe = null; 
        console.log('Colección Favoritos inicializada con Firestore y appId:', this.appId);
    },

    /**
     * @param {string} userId 
     */
    fetchFavorites: function(userId) {
        if (!userId) {
            console.warn('Favoritos Collection: No hay userId para cargar favoritos.');
            this.reset([]);
            if (this.unsubscribe) {
                this.unsubscribe(); 
                this.unsubscribe = null;
            }
            return;
        }
        if (!this.firebaseDb) {
            console.error('Favoritos Collection: Firestore no está inicializado.');
            return;
        }

        const favoritesRef = collection(this.firebaseDb, `artifacts/${this.appId}/users/${userId}/favorites`);
        console.log(`Intentando suscribirse a favoritos para userId: ${userId} en ruta: artifacts/${this.appId}/users/${userId}/favorites`);
        this.unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
            const fetchedFavorites = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fetchedFavorites.push({ id: doc.id, ...data });
            });
            console.log('Favoritos actualizados desde Firestore:', fetchedFavorites);
            this.set(fetchedFavorites, { remove: true });
        }, (error) => {
            console.error('Error al suscribirse a favoritos de Firestore:', error);
            window.showModalMessage('Error al cargar tus cómics favoritos. Consulta la consola para más detalles.');
        });
    },

    /**
     * @param {object} comicData 
     * @returns {Promise<DocumentReference>} 
     */
    addFavoriteToFirestore: async function(comicData) {
        const userId = this.getUserId();
        if (!userId) {
            window.showModalMessage('Debes iniciar sesión para añadir favoritos.');
            return;
        }
        if (!this.firebaseDb) {
            console.error('Firestore no está inicializado.');
            window.showModalMessage('Error de la aplicación: la base de datos no está lista.');
            return;
        }

        const favoritesRef = collection(this.firebaseDb, `artifacts/${this.appId}/users/${userId}/favorites`);
        const q = query(favoritesRef, where("marvelId", "==", comicData.marvelId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.warn(`El cómic con Marvel ID ${comicData.marvelId} ya es un favorito.`);
            window.showModalMessage('¡Este cómic ya está en tus favoritos!');
            return;
        }

        try {
            const dataToSave = { ...comicData, userId: userId };
            const docRef = await addDoc(favoritesRef, dataToSave);
            console.log("Favorito añadido con ID: ", docRef.id);
            window.showModalMessage('Cómic añadido a favoritos!');
            return docRef;
        } catch (e) {
            console.error("Error al añadir documento: ", e);
            window.showModalMessage('Error al añadir cómic a favoritos.');
            throw e; 
        }
    },

    /**
     * @param {string} favoriteDocId
     */
    removeFavoriteFromFirestore: async function(favoriteDocId) {
        const userId = this.getUserId();
        if (!userId) {
            window.showModalMessage('Debes iniciar sesión para eliminar favoritos.');
            return;
        }
        if (!this.firebaseDb) {
            console.error('Firestore no está inicializado.');
            window.showModalMessage('Error de la aplicación: la base de datos no está lista.');
            return;
        }

        try {
            const docRef = doc(this.firebaseDb, `artifacts/${this.appId}/users/${userId}/favorites`, favoriteDocId);
            await deleteDoc(docRef);
            console.log("Favorito eliminado con ID: ", favoriteDocId);
            window.showModalMessage('Cómic eliminado de favoritos.');
        } catch (e) {
            console.error("Error al eliminar documento: ", e);
            window.showModalMessage('Error al eliminar cómic de favoritos.');
            throw e; 
        }
    },


    stopListening: function() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
            console.log('Suscripción a favoritos de Firestore detenida.');
        }
    }
});