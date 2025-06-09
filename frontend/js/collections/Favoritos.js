
const Favoritos = Backbone.Collection.extend({
    model: Favorito, // Define que los modelos en esta colección son de tipo Favorito.

    initialize: function(models, options) {
        if (!options || !options.db || !options.getUserId || !options.appId) {
            console.error('Favoritos Collection: Se requieren opciones db, getUserId y appId para inicializar.');
            return;
        }
        this.db = options.db; // Instancia de Firebase Firestore
        this.getUserId = options.getUserId; // Función para obtener el ID de usuario actual
        this.appId = options.appId; // ID de la aplicación

        // Variable para almacenar la función de desuscripción del listener de Firestore.
        this.unsubscribeSnapshot = null;

        console.log('Colección Favoritos inicializada con Firestore y appId:', this.appId);
    },

    /**
     * Construye la referencia a la colección de Firestore para los favoritos de un usuario.
     * Los datos de favoritos se almacenan en una subcolección privada del usuario:
     * `/artifacts/{appId}/users/{userId}/favoritos`.
     * @param {string} userId - El ID del usuario actual.
     * @returns {firebase.firestore.CollectionReference} La referencia a la colección de Firestore.
     */
    getFavoritesCollectionRef: function(userId) {
        if (!userId) {
            console.error("No se puede obtener la referencia de la colección de favoritos: userId es nulo.");
            return null;
        }
        // Ruta para los datos privados de un usuario en Firestore
        return firebase.firestore.collection(this.db, `artifacts/${this.appId}/users/${userId}/favoritos`);
    },

    /**
     * Carga los cómics favoritos de un usuario desde Firestore.
     * Usa `onSnapshot` para escuchar cambios en tiempo real.
     * @param {string} userId - El ID del usuario cuyos favoritos se cargarán.
     */
    fetchFavorites: function(userId) {
        if (!userId) {
            console.error('No se puede cargar favoritos: userId es nulo.');
            this.reset([]); // Limpia la colección si no hay usuario.
            if (this.unsubscribeSnapshot) {
                this.unsubscribeSnapshot(); // Desuscribirse si ya estaba suscrito.
                this.unsubscribeSnapshot = null;
            }
            return;
        }

        // Si ya hay una suscripción activa, desuscribirse primero para evitar duplicados.
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }

        const favoritesRef = this.getFavoritesCollectionRef(userId);
        if (!favoritesRef) return;

        // Escucha cambios en tiempo real en la colección de favoritos del usuario.
        this.unsubscribeSnapshot = onSnapshot(favoritesRef, (snapshot) => {
            const fetchedFavorites = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Crea un nuevo modelo Favorito con el ID del documento de Firestore
                // y los datos del cómic, incluyendo el comicId de Marvel.
                fetchedFavorites.push({
                    id: doc.id, // ID del documento de Firestore
                    comicId: data.comicId,
                    title: data.title,
                    thumbnail: data.thumbnail,
                    description: data.description,
                    userId: data.userId
                });
            });
            this.reset(fetchedFavorites); // Reemplaza todos los modelos en la colección.
            console.log(`Favoritos cargados exitosamente para el usuario ${userId}:`, this.length);
        }, (error) => {
            console.error('Error al escuchar favoritos de Firestore:', error);
            window.showModalMessage(`Error al cargar tus favoritos: ${error.message}`);
        });
    },

    /**
     * Añade un nuevo cómic favorito a Firestore.
     * @param {object} comicData - Un objeto con los datos del cómic (comicId, title, thumbnail, description).
     * @returns {Promise<Favorito>} Una promesa que se resuelve con el modelo Favorito añadido.
     */
    addFavoriteToFirestore: async function(comicData) {
        const userId = this.getUserId();
        if (!userId) {
            window.showModalMessage('Debes iniciar sesión para guardar favoritos.');
            throw new Error('Usuario no autenticado.');
        }

        // Verificar si el cómic ya es un favorito para este usuario.
        const existingFavorite = this.findWhere({ comicId: comicData.comicId, userId: userId });
        if (existingFavorite) {
            window.showModalMessage('¡Este cómic ya está en tus favoritos!');
            return existingFavorite; // Devolver el modelo existente si ya es un favorito.
        }

        const favoritesRef = this.getFavoritesCollectionRef(userId);
        if (!favoritesRef) return;

        try {
            // Prepara los datos para guardar en Firestore.
            const newFavoriteData = {
                comicId: comicData.comicId,
                title: comicData.title,
                thumbnail: comicData.thumbnail || '', // Asegurarse de que thumbnail sea una cadena vacía si es nulo.
                description: comicData.description || '', // Asegurarse de que description sea una cadena vacía si es nulo.
                userId: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Para ordenar o saber cuándo se añadió
            };

            // Añade el documento a la subcolección de favoritos del usuario.
            const docRef = await addDoc(favoritesRef, newFavoriteData);
            console.log('Documento de favorito añadido con ID:', docRef.id);

            // Crea un nuevo modelo Backbone.Favorito y lo añade a la colección local.
            const newFavoriteModel = new Favorito({ id: docRef.id, ...newFavoriteData });
            this.add(newFavoriteModel); // Añadir el nuevo modelo a la colección local
            window.showModalMessage('¡Cómic añadido a favoritos!');
            return newFavoriteModel;
        } catch (error) {
            console.error('Error al añadir favorito a Firestore:', error);
            window.showModalMessage(`Error al añadir cómic a favoritos: ${error.message}`);
            throw error; // Re-lanzar el error para que pueda ser manejado por la vista.
        }
    },

    /**
     * Elimina un cómic favorito de Firestore y de la colección local.
     * @param {string} favoriteDocId - El ID del documento del favorito en Firestore.
     * @returns {Promise<void>} Una promesa que se resuelve cuando el favorito es eliminado.
     */
    removeFavoriteFromFirestore: async function(favoriteDocId) {
        const userId = this.getUserId();
        if (!userId) {
            window.showModalMessage('Debes iniciar sesión para eliminar favoritos.');
            throw new Error('Usuario no autenticado.');
        }

        const favoriteDocRef = firebase.firestore.doc(this.db, `artifacts/${this.appId}/users/${userId}/favoritos/${favoriteDocId}`);

        try {
            await deleteDoc(favoriteDocRef);
            console.log('Documento de favorito eliminado con ID:', favoriteDocId);
            this.remove(favoriteDocId); // Elimina el modelo de la colección local.
            window.showModalMessage('Cómic eliminado de favoritos.');
        } catch (error) {
            console.error('Error al eliminar favorito de Firestore:', error);
            window.showModalMessage(`Error al eliminar cómic de favoritos: ${error.message}`);
            throw error; // Re-lanzar el error.
        }
    },

    /**
     * Detiene la suscripción activa a Firestore.
     * Es importante llamar a esto cuando la aplicación se cierra o el usuario cierra sesión.
     */
    stopListening: function() {
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
            this.unsubscribeSnapshot = null;
            console.log('Suscripción a favoritos de Firestore detenida.');
        }
    }
});
