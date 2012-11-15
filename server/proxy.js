var http = require('http');
var url = require('url');

var port = process.env.PORT || 5000;
var proxy = function(request, responce){

    var loaderOptions = {
        host: 'ostrovok.ru',
        port: 80,
        path: '/api/v1/rooms/x863982519/' + url.parse(request.url).search,
        method: 'GET'
    };

    var loader = http.request(loaderOptions, function(res){
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log('BODY: ' + chunk);
            closeConnection(chunk);
        });
    });

    var closeConnection = function(data){
        responce.write(
            '<h1>Test</h1>' +
            '<hr>' +
            'pathname: ' + requestPathname +
            '<hr>' +
            'data: ' + data
        );
        responce.end();
    };

    responce.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });

    loader.on('error', function(e){
        console.log('problem with request: ' + e.message);
    });
};

http.createServer(proxy).listen(port);
