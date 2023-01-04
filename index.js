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
	
	if (req.url == "/")
// 		sendIndex(req, res);
		send404(req, res);
	else if (req.url == "/main.css")
		send404(req, res);
	else if (req.url == "/print.css")
		send404(req, res);
	else
		send404(req, res);
});


// Functions
function sendPage(req, res) {
	// TODO: Replace With Template File
	// TODO: Implement CSS Stylesheet
// 	req.flushHeaders(); // Send headers out now

	var stream = fs.createReadStream('template/page.html');
	
	const chunks = [];
	stream.on("data", function (chunk) {
		chunks.push(chunk);
	});

	// Send the buffer or you can put it into a var
	stream.on("end", function () {
		console.log("Test");
		res.write(Buffer.concat(chunks));
	});
	
// 	res.end();
}

function send404(req, res) {
	res.statusCode = 404;
	res.setHeader('Content-Type', 'text/html');
	
	sendPage(req, res);

	res.write("<h1 style='color: white;'>404 - Page Not Found</h1>");
}

function sendIndex(req, res) {
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
				
				sendPage(req, res);
				
				// For Printing The Results.
				// TODO: Cleanup
				res.write("<table style='color: white; border: 1px solid red; width: 100%; border-collapse: collapse;'>");
				res.write("<tr style='border: 1px solid red'><th>Piece</th><th>Company</th><th>Product</th><th>Product ID</th></tr>");
				result.forEach(function(element, index, array) {
					// piece, company, product, product_id
					
					// Hide Hidden Products
					if (element["hidden"] == 1)
						return;
					
					if (element["company"] == "redbubble") {
						if (element["product"] != "transparent_sticker")
							return;
					}
					
					if (element["company"] == "spoonflower") {
						if (element["product"] != "fabric")
							return;
					}
					
					res.write("<tr style='border: 1px dotted red'><td style='border-right: 1px dashed red'>" + element["piece"] + "</td><td style='border-left: 1px dashed red; border-right: 1px dashed red'>" + element["company"] + "</td><td style='border-left: 1px dashed red; border-right: 1px dashed red'>" + element["product"] + "</td><td style='border-left: 1px dashed red'>");
					
					// Testing Link Generation
					if (element["company"] == "deviantart")
						res.write("<a href='https://www.deviantart.com/x/art/" + element["product_id"] + "'>" + element["product_id"] + "</a>");
					else if (element["company"] == "flickr")
						res.write("<a href='https://www.flickr.com/photos/alexis_art/" + element["product_id"] + "'>" + element["product_id"] + "</a>");
					else if (element["company"] == "printerstudio")
						res.write("<a href='https://www.printerstudio.com/sell/designs/" + element["product_id"] + ".html'>" + element["product_id"] + "</a>");
					else if (element["company"] == "spoonflower") // TODO: Get actual product instead of forcing it to be fabric
						res.write("<a href='https://www.spoonflower.com/en/fabric/" + element["product_id"] + "'>" + element["product_id"] + "</a>");
					else if (element["company"] == "redbubble") // TODO: Get actual product instead of forcing it to be stickers
						res.write("<a href='https://www.redbubble.com/i/x/x/" + element["product_id"] + ".OP1U7'>" + element["product_id"] + "</a>");
					else if (element["company"] == "guilded" && element["product"] == "artgroup")
						res.write("<a href='https://www.guilded.gg/Alexis-Art/groups/DkxYegJd/channels/e03fecfa-f21b-43da-a11f-d9858c7afe33/media/" + element["product_id"] + "'>" + element["product_id"] + "</a>");
					else
						res.write(element["product_id"]);
					
					res.write("</td></tr>");
				});
				res.write("</table>");
			} catch (err) {
				console.error("Failed To Execute Query! " + err);
	// 			process.exit(1);
			}
		});
	});
	
// 	res.end();
}

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
