/**
 * Created by weltonnascimento on 17/06/14.
 */
window.onload = function () {


};

var QueryDelegator = {

    importio: importio,

    init: function () {
        this.importio.init({
            "auth": {
                "userGuid": "141547c0-ef77-42f2-91a3-7f827efa4fff",
                "apiKey": "P7zA1zht+BQms57D4M7anoIo5W1htE1XUFEmVI0A0xPVMPIkUC6A9IbAJbbGGKgnvQb78t0lIrrPfvdpNi6y/g=="
            },
            "host": "import.io"
        });
    },
    setCache: function (key, data) {
        try {
            simpleStorage.set(key, data, {TTL: 0});
        } catch (e) {
            console.warn(e);
        }
    },
    getCache: function (key) {
        var data;
        try {
            data = simpleStorage.get(key);
        } catch (e) {
            console.warn(e);
        }

        return data;
    },
    queryNoticia: function (query, onDataCallBack) {
        var url = 'http://www.folhabv.com.br/noticia.php?id=' + query;

        var data = this.getCache(url);

        var onQueryResponse = function (data) {
            QueryDelegator.setCache(url, data);
            onDataCallBack(data);
        };

        if (data) {
            onDataCallBack(data);
        } else {
            importio.query({
                    "connectorGuids": ["bd1ecb86-72ad-42b6-90ea-d2e152ef1dcc"],
                    "input": {"webpage/url": url}},
                { "data": onQueryResponse });
        }

    }

};

function formataNoticia(noticia) {

    if (noticia !== undefined) {
        var view = {
            titulo: noticia['titulo'],
            datetime: noticia['datetime/_source'],
            texto: noticia['texto']
        };
        var template = $('#template').html();


        var rendered;
        try {
            rendered = Mustache.render(template, view);
        } catch (e) {
            //TODO: Lidar com erros de interpretação no template.
            //Show this ugly bitch to the user.
            rendered = '<div>HOUVE UM ERRO AO CONECTAR AO SERVIDOR.</div>';
        }
        return rendered;
    }
}

// Load the data for a specific category, based on
// the URL passed in. Generate markup for the items in the
// category, inject it into an embedded page, and then make
// that page the current active page.
function showNoticia(urlObj, options) {
    // Indicate loading;


    var idNoticia = urlObj.hash.replace(/.*idNoticia=/, ""),

    // The pages we use to display our content are already in
    // the DOM. The id of the page we are going to write our
    // content into is specified in the hash before the '?'.
        pageSelector = '#detalheNoticia';

    // The page we are going into;
    var $page = $(pageSelector);

    $.mobile.loading('show');

    //TODO: error handling;
    var dataCallBack = function (data) {
        console.log(["Data received: " + Date.now(), data]);

        var rendered = formataNoticia(data[0].data);

        console.log(rendered);

        $(pageSelector).html(rendered);

        // Pages are lazily enhanced. We call page() on the page
        // element to make sure it is always enhanced before we
        // attempt to enhance the listview markup we just injected.
        // Subsequent calls to page() are ignored since a page/widget
        // can only be enhanced once.
        $page.page();

        // We don't want the data-url of the page we just modified
        // to be the url that shows up in the browser's location field,
        // so set the dataUrl option to the URL for the category
        // we just loaded.
        options.dataUrl = urlObj.href;

        // Show the page;
        $.mobile.loading('hide');
        $.mobile.changePage($page, options);
        // Now call changePage() and tell it to switch to
        // the page we just modified.
//        $.mobile.changePage( $page, options );

    };

    //Do the actual query for data.
    console.log('Will query: ' + Date.now());

    // Handles cache and stuff
    //TODO: Seria ideal ter um plano B para o caso da rede não completar a requisição.
    QueryDelegator.queryNoticia(idNoticia, dataCallBack);

//    if ( noticia ) {
//        // Get the page we are going to dump our content into.
//        var $page = $(  ),
//
//        // Get the header for the page.
//            $header = $page.children( ":jqmData(role=header)" ),
//
//        // Get the content area element for the page.
//            $content = $page.children( ":jqmData(role=content)" ),
//
//        // The markup we are going to inject into the content
//        // area of the page.
//            markup = "<p>" + noticia.description + "</p><ul data-role='listview' data-inset='true'>",
//
//        // The array of items for this category.
//            cItems = category.items,
//
//        // The number of items in the category.
//            numItems = cItems.length;
//
//        // Generate a list item for each item in the category
//        // and add it to our markup.
//        for ( var i = 0; i < numItems; i++ ) {
//            markup += "<li>" + cItems[i].name + "</li>";
//        }
//        markup += "</ul>";
//
//        // Find the h1 element in our header and inject the name of
//        // the category into it.
//        $header.find( "h1" ).html( noticia['titulo'] );
//
//        // Inject the category items markup into the content element.
//        $content.html( markup );
//
//        // Pages are lazily enhanced. We call page() on the page
//        // element to make sure it is always enhanced before we
//        // attempt to enhance the listview markup we just injected.
//        // Subsequent calls to page() are ignored since a page/widget
//        // can only be enhanced once.
//        $page.page();
//
//        // Enhance the listview we just injected.
//        $content.find( ":jqmData(role=listview)" ).listview();
//
//        // We don't want the data-url of the page we just modified
//        // to be the url that shows up in the browser's location field,
//        // so set the dataUrl option to the URL for the category
//        // we just loaded.
//        options.dataUrl = urlObj.href;
//
//        // Now call changePage() and tell it to switch to
//        // the page we just modified.
//        $.mobile.changePage( $page, options );
//    }
}

QueryDelegator.init();

// Listen for any attempts to call changePage().
$(document).bind("pagebeforechange", function (e, data) {

    // We only want to handle changePage() calls where the caller is
    // asking us to load a page by URL.
    if (typeof data.toPage === "string") {

        // We are being asked to load a page by URL, but we only
        // want to handle URLs that request the data for a specific
        // category.
        var u = $.mobile.path.parseUrl(data.toPage),
            re = /^#detalheNoticia/;

        if (u.hash.search(re) !== -1) {

            // We're being asked to display the items for a specific category.
            // Call our internal method that builds the content for the category
            // on the fly based on our in-memory category data structure.
            showNoticia(u, data.options);

            // Make sure to tell changePage() we've handled this call so it doesn't
            // have to do anything.
            e.preventDefault();
        }
    }
});