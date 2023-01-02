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
	
	var sql = "select * from sellables;";
	pool.getConnection(function(err, con) {
		con.query(sql, function (err, result, fields) {
			try {
				if (err) throw err;
				
				// Debug
// 				console.log('Result: ');
// 				result.forEach(function(element, index, array) {
// 					console.log(JSON.stringify(element));
// 				});
				  
// 				console.log('Result: ' + JSON.stringify(result));
				
				// TODO: Implement CSS Stylesheet
				res.write("<!DOCTYPE html>");
				res.write("<html><head>");
				res.write('<meta charset="UTF-8">');
				res.write("<!-- Will setup proper page generation later -->");
				res.write("<meta name='viewport' content='width=device-width, initial-scale=1' />");
				res.write("<!-- As of the time of writing, all art is All Rights Reserved. ");
				res.write("This means both humans and ai are not allowed to reuse my images. ");
				res.write("This may change in the future. -->");
				res.write('<meta name="robots" content="noai, noimageai">');
				
				// Google Analytics
				// process.env.GA_ID is public knowledge, I just want to separate the id between dev and production
				res.write('<script async src="https://www.googletagmanager.com/gtag/js?id=' + process.env.GA_ID + '"></script>');
				res.write('<script>');
				res.write('  window.dataLayer = window.dataLayer || [];');
				res.write('  function gtag(){dataLayer.push(arguments);}');
				res.write("  gtag('js', new Date());");
				res.write("  gtag('config', '" + process.env.GA_ID + "');");
				res.write('</script>');
				// ---
				
				res.write("</head>");
				res.write("<body bgcolor='black'><p style='color: white;'>");
				
				// For Printing The Results.
				// TODO: Cleanup
				res.write("<table style='color: white; border: 1px solid red; width: 100%; border-collapse: collapse;'>");
				res.write("<tr style='border: 1px solid red'><th>Piece</th><th>Company</th><th>Product</th><th>Product ID</th></tr>");
				result.forEach(function(element, index, array) {
					// piece, company, product, product_id
					res.write("<tr style='border: 1px dotted red'><td style='border-right: 1px dashed red'>" + element["piece"] + "</td><td style='border-left: 1px dashed red; border-right: 1px dashed red'>" + element["company"] + "</td><td style='border-left: 1px dashed red; border-right: 1px dashed red'>" + element["product"] + "</td><td style='border-left: 1px dashed red'>" + element["product_id"] + "</td></tr>");
				});
				res.write("</table>");
				
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
