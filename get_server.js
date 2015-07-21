// Setup the required packages
var express = require('express'),
	fs = require('fs'),
	request = require('request'),
	mkdirp = require('mkdirp');

var app = express();

// Serve up static content
app.use(express.static('static'));

app.get('/boards/:boardID(*)', function (req, res){

	path = __dirname + '/boards/' + req.params.boardID;

	res.download(path);
})

// Listen for post requests on the '/parse' url
app.get('/parse', function (req, res) {

	// Grab the trelloBoard parameter from the GET request
	// and initialize local variables
	var token = req.query.token;

	if (req.query.getOrg) {
		// Request the JSON file from the URL
		var url = "https://trello.com/1/members/my/organizations?key=a177d41f6a97186db0f98352a281198c&token=" + token;

		request(url, function (error, response, trelloJSON) {

			trelloJSON = JSON.parse(trelloJSON);

			fs.writeFile('trelloJSON.json', JSON.stringify(trelloJSON, null, 4), function (err) {
				console.log('trelloJSON.json file successfully written.');
			});
		});
	}

	var boardID = req.query.trelloBoard;
	var boardName = req.query.boardName;

	// Change the filename extension to .json for the JSON format
	// You'll also need to change the second param in fs.writeFile
	var fileName = boardName + "_" + boardID + '.md';
	var path = "boards/" + fileName;

	var url = "https://api.trello.com/1/boards/" + boardID + "/lists?cards=open&key=a177d41f6a97186db0f98352a281198c&token=" + token;

	request(url, function (error, response, trelloBoard) {

		var trelloBoard = JSON.parse(trelloBoard);
		var lists = {};

		var md = "#" + boardName + "\r\n";

		// Iterate through lists
		for (var i = 0; i < trelloBoard.length; i++) {

			// Instantiate cardsList variable as empty array
			var cardsList = [];

			md += "##" + trelloBoard[i].name + "\r\n"

			// Iterate through cards and add each card name to array
			for (var t = 0; t < trelloBoard[i].cards.length; t++) {

				var cardName = trelloBoard[i].cards[t].name;
				var cardDesc = trelloBoard[i].cards[t].desc;

				// If the card has a description then add it as a property
				if (cardDesc.length > 0) {

					var newCard = {}
					newCard.name = cardName;
					newCard.description = cardDesc;

					cardsList.push(newCard);
					md += "- " + cardName + "\r\n";
					md += "*" + cardDesc + "*\r\n\r\n";

				} else {
					md +=  "- " + cardName + "\r\n\r\n";
					cardsList.push(cardName);
				}
			}

			// Add the card names array to a property in the lists object
			// with the property name as the list name.
			lists[trelloBoard[i].name] = cardsList;
		}

		// Create the boards folder if one doesn't already exist.
		mkdirp(__dirname + '/boards/');

		fs.stat(path, function(err, stats){
			if (err) {
				// File doesn't exist
			}else {
				// File exists
			}
		})

		// Write the lists json object to a file with the name as the
		// board name
		// fs.writeFile(path, JSON.stringify(lists, null, 4), function (err) {

		fs.writeFile(path, md, function (err) {

			console.log('New file created at ' + __dirname + '/' + path);
			res.send({"fileName": fileName});

		});
	});
});

console.log("Listening on port 80");
app.listen(80);
