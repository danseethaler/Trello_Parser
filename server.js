// Setup the required packages
var express = require('express'),
	fs = require('fs'),
	bodyParser = require("body-parser"),
	request = require('request');

var app = express();

// Serve up static content
app.use(express.static('static'));

// Parse out the post request body
app.use(bodyParser.urlencoded({
	extended: false
}));

// Listen for post requests on the '/parse' url
app.post('/parse', function (req, res) {

	console.log("running parse code");

	// Request the JSON file from the URL
	var url = "https://api.trello.com/1/board/4d5ea62fd76aa1136000000c?key=a177d41f6a97186db0f98352a281198c&token=ccb7812a2c92e35cc319ea7f76541834f1d6345e933f253f9c39be7a43d32e81";
	var url = "https://trello.com/1/members/my/organizations?key=a177d41f6a97186db0f98352a281198c&token=ccb7812a2c92e35cc319ea7f76541834f1d6345e933f253f9c39be7a43d32e81";

	request(url, function (error, response, trelloJSON) {

        trelloJSON = JSON.parse(trelloJSON);

		fs.writeFile('trelloJSON.json', JSON.stringify(trelloJSON, null, 4), function (err) {
			console.log('File successfully written.');
		});

	});

	// Request the JSON file from the URL
    var boardID = "pWtPUFck";
	var url = "https://trello.com/1/boards/" + boardID + "?key=a177d41f6a97186db0f98352a281198c&token=ccb7812a2c92e35cc319ea7f76541834f1d6345e933f253f9c39be7a43d32e81";

	request(url, function (error, response, trelloBoards) {

        console.log(trelloBoards);

        trelloBoard = JSON.parse(trelloBoard);

		fs.writeFile('trelloBoard.json', JSON.stringify(trelloBoards, null, 4), function (err) {
			console.log('File successfully written.');
		});

	});
});

app.listen(3000);
