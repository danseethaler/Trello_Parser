// Setup the required packages
var express = require('express'),
	fs = require('fs'),
	request = require('request'),
	mkdirp = require('mkdirp');

var app = express();

// Serve up static content
app.use(express.static('static'));

app.get('/boards/:boardID(*)', function (req, res){

	var file = req.params.boardID,
	path = __dirname + '/boards/' + file;

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
	var file = boardID + '.json';
	var path = "boards/" + file;
	var url = "https://api.trello.com/1/boards/" + boardID + "/lists?cards=open&key=a177d41f6a97186db0f98352a281198c&token=" + token;

	request(url, function (error, response, trelloBoard) {

		var trelloBoard = JSON.parse(trelloBoard);
		var listsCount = trelloBoard.length;
		var lists = {};

		// Iterate through lists
		for (var i = 0; i < trelloBoard.length; i++) {

			// Instantiate cardsList variable as empty array
			var cardsList = [];

			// Iterate through cards and add each card name to array
			for (var t = 0; t < trelloBoard[i].cards.length; t++) {

				// If the card has a description then add it as a property
				if (trelloBoard[i].cards[t].desc.length > 0) {

					var cardName = trelloBoard[i].cards[t].name;
					var cardDesc = trelloBoard[i].cards[t].desc;

					cardsList.push({
						cardName: cardDesc
					});
				} else {
					cardsList.push(trelloBoard[i].cards[t].name);
				}
			}

			// Add the card names array to a property in the lists object
			// with the property name as the list name.
			lists[trelloBoard[i].name] = cardsList;
		}

		// Create the boards folder if one doesn't already exist.
		mkdirp(__dirname + '/boards/', function(err) {

			console.log("Error in mkdirp");
			console.log(err);

		});

		fs.stat(path, function(err, stats){
			if (err) {
				console.log("error occured - file doesn't exist?");
			}else {
				console.log(stats);
			}
		})

		// Write the lists json object to a file with the name as the
		// board name
		fs.writeFile(path, JSON.stringify(lists, null, 4), function (err) {

			console.log('New file created at ' + __dirname + '/' + path);
			res.send('New file created at ' + __dirname + '/' + path);

		});
	});
});

console.log("Listening on port 80");
app.listen(80);