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
	var url = "https://trello.com/1/members/my/organizations?key=a177d41f6a97186db0f98352a281198c&token=ccb7812a2c92e35cc319ea7f76541834f1d6345e933f253f9c39be7a43d32e81";

	request(url, function (error, response, trelloJSON) {

        trelloJSON = JSON.parse(trelloJSON);

		fs.writeFile('trelloJSON.json', JSON.stringify(trelloJSON, null, 4), function (err) {
			console.log('File successfully written.');
		});

	});

	// Request the JSON file from the URL

    // Grab the trelloBoard parameter from the AJAX request.
    var boardID = req.body.trelloBoard;

    var path = "boards/" + boardID + '.json';
	var url = "https://api.trello.com/1/boards/" + boardID + "/lists?cards=open&key=a177d41f6a97186db0f98352a281198c&token=ccb7812a2c92e35cc319ea7f76541834f1d6345e933f253f9c39be7a43d32e81";

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

                    console.log(cardName,cardDesc);

                    cardsList.push({cardName:cardDesc});
                }else {
                    cardsList.push(trelloBoard[i].cards[t].name);
                }
            }

            // Add the card names array to a property in the lists object
            // with the property name as the list name.
            lists[trelloBoard[i].name] = cardsList;
        }

        // Write the lists json object to a file with the name as the
        // board name
		fs.writeFile(path, JSON.stringify(lists, null, 4), function (err) {
			console.log('New file created at ' + path);
		});

	});
});

app.listen(3000);
