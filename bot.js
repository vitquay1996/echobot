const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

app = express();

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Messenger API parameters
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
	throw new Error('missing FB_PAGE_ID');
}
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
	throw new Error('missing FB_PAGE_TOKEN');
}
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

//set up server
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());


// Send message
function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: FB_PAGE_TOKEN },
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			console.log("Successfully sent generic message with id %s to recipient %s", 
				messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});  
}

// Setting up webhook
app.get('/fb', function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
		console.log("Validating webhook");
	res.status(200).send(req.query['hub.challenge']);
} else {
	console.error("Failed validation. Make sure the validation tokens match.");
	res.sendStatus(403);          
}  
});

// receive message
app.post('/fb', function (req, res) {
	var data = req.body;

	var messagingEvent = data.entry[0].messaging;

	for (var i=0; i<messagingEvent.length; i++) {
		var event = messagingEvent[i];

		if (event.message && event.message.text){
			var sender = event.sender.id;
			var message = event.message.text;
			console.log(event);
			sendTextMessage(sender, "hoi j the : " + message);
		}

	}
	res.sendStatus(200);
});