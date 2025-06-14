
const Comics = Backbone.Collection.extend({
    model: Comic,

    url: 'http://localhost:3000/api/comics?',

    fetchByTitle: function (title) {
        // Muestra un mensaje de carga en el elemento 'messages'.
        document.getElementById('messages').innerHTML = '<p class="text-blue-500">Cargando cómics...</p>';

        this.fetch({
            reset: true,
            data: {
                title: title
            },
            success: (collection, response) => {
                console.log('Cómics cargados exitosamente:', collection.toJSON());
                document.getElementById('messages').innerHTML = '';
                if (collection.isEmpty()) {
                    document.getElementById('messages').innerHTML = '<p class="text-orange-500">No se encontraron cómics con ese título.</p>';
                }
            },
            error: (collection, response) => {
                console.error('Error al cargar cómics:', response);
                document.getElementById('messages').innerHTML = `<p class="text-red-500">Error al cargar cómics: ${response.statusText || 'Error desconocido'}. Revisa la consola para más detalles.</p>`;
            }
        });
    },

    parse: function (response) {
        if (response && response.data && response.data.results) {
            return response.data.results.map(comic => ({
                id: comic.id,
                title: comic.title,
                description: comic.description || 'Sin descripción disponible.',
                thumbnail: comic.thumbnail ? `${comic.thumbnail.path}.${comic.thumbnail.extension}` : 'https://placehold.co/150x225/e0e0e0/ffffff?text=No+Image'
            }));
        }
        return [];
    }
});
