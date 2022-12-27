// Imports
const http = require('http');
const fs = require('fs');
const path = require('path');
const process = require('process');


// Constants
const hostname = 'localhost';
const port = 8080;


// Variables
var mysql = require('mysql');

// Pool because https://stackoverflow.com/a/37326025
var pool = mysql.createPool({
//   connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  debug: false
});

const server = http.createServer((req, res) => {
    console.log('Request for ' + req.url + ' by method ' + req.method);
	
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');
	
	var sql = "show databases;";
	pool.getConnection(function(err, con) {
		con.query(sql, function (err, result, fields) {
			try {
				if (err) throw err;
				
				console.log('Result: ' + JSON.stringify(result));
				
				res.write("<!DOCTYPE html>");
				res.write("<html><head>");
				res.write('<meta charset="UTF-8">');
				res.write("<!-- Will setup proper page generation later -->");
				res.write("<meta name='viewport' content='width=device-width, initial-scale=1' />");
				res.write("<!-- As of the time of writing, all art is All Rights Reserved. ");
				res.write("This means both humans and ai are not allowed to reuse my images. ");
				res.write("This may change in the future. -->");
				res.write('<meta name="robots" content="noai, noimageai">');
				res.write("</head>");
				res.write("<body bgcolor='black'><p style='color: white;'>");
				res.write('Result: ' + JSON.stringify(result));
				res.write("</p></body></html>");
	// 			fs.createReadStream(result).pipe(res);
				
				res.end();
			} catch (err) {
				console.error("Failed To Execute Query! " + err);
	// 			process.exit(1);
			}
		});
	});
	
// 	res.end();
});


// Functions
function setupDatabase() {
	// For setting up database from scratch if needed and possible
// 	CREATE USER 'process.env.DB_USERNAME'@'process.env.DB_HOST' IDENTIFIED BY 'process.env.DB_PASSWORD';
// 	GRANT INSERT, UPDATE, DELETE, SELECT ON process.env.DB_NAME.* to 'process.env.DB_USERNAME'@'process.env.DB_HOST';
// 	CREATE DATABASE art;
// 	USE art;
// 	CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))
}

function startDatabase() {
	// Try to connect to database, else fail out
	
	// Check If Missing Environment Variables For Connecting To MySql Database
	if (process.env.DB_USERNAME === undefined || process.env.DB_PASSWORD === undefined || process.env.DB_HOST === undefined || process.env.DB_NAME === undefined) {
		var missing_vars = "";
		// TODO: Check if equivalent of Python list joining exists - See .join(",");
		if (process.env.DB_USERNAME === undefined)
			missing_vars += "DB_USERNAME, ";
		if (process.env.DB_PASSWORD === undefined)
			missing_vars += "DB_PASSWORD, ";
		if (process.env.DB_HOST === undefined)
			missing_vars += "DB_HOST, ";
		if (process.env.DB_NAME === undefined)
			missing_vars += "DB_NAME";
		
		console.error("Missing Environment Variable(s): " + missing_vars);
		process.exit(1);
	}
	
	pool.getConnection(function(err, con) {
		try {
			if (err) throw err;
				
			console.log("Connected!");
			setupDatabase();
		} catch (err) {
			console.error("Failed To Connect! " + err);
			process.exit(1);
		}
	});
}

function startServer() {
	// Start webserver
	
	server.listen(port, hostname, () => {
		console.log(`Server running at http://${hostname}:${port}/`);
		
		// For Initial Connection - We May Lose Connection During Runtime
		startDatabase();
	});
}

function main() {
	// We May Setup Configuration Here, We've Only Got The Server For Now Though
	startServer();
}


// Loose Functions
/* process.on('uncaughtException', function (err) {
	console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
	console.error(err.stack);
	process.exit(1);
});*/


// Initiator
if (typeof require !== 'undefined' && require.main === module) {
	// Call Main Function If Script Ran Directly
	main();
}
