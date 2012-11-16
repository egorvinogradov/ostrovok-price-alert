var http = require('http');
var url = require('url');

var port = process.env.PORT || 5000;
var proxy = function(request, response){

    console.log('url', request.url);
    
    var chunks = [];
    var loaderOptions = {
        host: 'ostrovok.ru',
        port: 80,
        path: url.parse(request.url).pathname + url.parse(request.url).search,
        method: 'GET'
    };

    var closeConnection = function(data){
        response.write(data);
        response.end();
    };

    response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });

    var loader = http.request(loaderOptions, function(res){
        console.log('response', res.statusCode, '\n', res.headers, '\n\n');
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log('data', chunk, '\n\n');
            chunks.push(chunk);
        });
        res.on('end', function(){
            closeConnection(chunks.join(''));
        });
    });

    loader.on('error', function(e){
        console.log('', e);
        closeConnection({
            status: 404
        });
    });

    loader.end();
};

http.createServer(proxy).listen(port);
