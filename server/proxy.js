var http = require('http');
var url = require('url');

var port = process.env.PORT || 5000;
var proxy = function(request, response){

    console.log('url', request.url);
    
    var chunks = [];
    var headers = {
        'Access-Control-Allow-Origin': '*'
    };
    var loaderOptions = {
        host: 'ostrovok.ru',
        port: 80,
        path: url.parse(request.url).pathname + url.parse(request.url).search,
        method: 'GET'
    };

    var closeConnection = function(statusCode, headers, data){
        response.writeHead(statusCode, headers);
        response.write(data);
        response.end();
    };

    var addToObject = function(obj, params){
        for ( var key in params ) {
            obj[key] = params[key];
        }
    };

    var loader = http.request(loaderOptions, function(res){
        console.log('response', res.statusCode, '\n', res.headers, '\n\n');
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log('data', chunk, '\n\n');
            chunks.push(chunk);
            addToObject(headers, res.headers);
        });
        res.on('end', function(){
            closeConnection(200, headers, chunks.join(''));
        });
    });

    loader.on('error', function(e){
        console.log('error', e, '\n\n');
        closeConnection(404, headers, JSON.stringify({
            status: 404
        }));
    });

    loader.end();
};

http.createServer(proxy).listen(port);
