var http = require('http');
var url = require('url');

var port = process.env.PORT || 5000;
var proxy = function(request, response){

    console.log('url', request.url);
    
    var headers;
    var chunks = [];
    var loaderOptions = {
        host: 'ostrovok.ru',
        port: 80,
        path: url.parse(request.url).pathname + url.parse(request.url).search,
        method: 'GET'
    };

    var closeConnection = function(headers, data){
        response.writeHead(200, headers);
        response.write(data);
        response.end();
    };

    var loader = http.request(loaderOptions, function(res){
        console.log('response', res.statusCode, '\n', res.headers, '\n\n');
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log('data', chunk, '\n\n');
            chunks.push(chunk);
            headers = res.headers;
        });
        res.on('end', function(){
            headers['Access-Control-Allow-Origin'] = '*';
            closeConnection(headers, chunks.join(''));
        });
    });

    loader.on('error', function(e){
        console.log('error', e, '\n\n');
        closeConnection({
            status: 404
        });
    });

    loader.end();
};

http.createServer(proxy).listen(port);
