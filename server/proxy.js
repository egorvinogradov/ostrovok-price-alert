var http = require('http');
var port = process.env.PORT || 5000;
var proxy = function(request, responce){
    responce.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    responce.write('it works');
    responce.end();
};

http.createServer(proxy).listen(port);
