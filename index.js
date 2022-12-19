const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 8080;

const server = http.createServer((req, res) => {
    console.log('Request for ' + req.url + ' by method ' + req.method);
	
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');
	
	res.write('Request for ' + req.url + ' by method ' + req.method);
// 	fs.createReadStream(filePath).pipe(res);
	
	res.end()
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
