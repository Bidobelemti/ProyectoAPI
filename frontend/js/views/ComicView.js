
const ComicView = Marionette.View.extend({
    tagName: 'div',

    className: 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2',

    template: _.template(`
        <div class="comic-card p-4 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src="<%= thumbnail %>" alt="<%= title %>" class="w-36 h-54 object-cover rounded mb-3 shadow-sm">
            <h2 class="text-lg text-gray-700 font-semibold mb-1"><%= title %></h2>
            <p class="text-sm text-gray-700 text-ellipsis overflow-hidden h-20"><%= description %></p>
            <div class="mt-auto flex justify-end">
                <button class="view-details-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150">
                    Ver Detalles
                </button>
            </div>
        </div>
    `)

    
});
