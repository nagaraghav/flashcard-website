'use strict';

// An element to go into the DOM

var lango = React.createElement(
	"div",
	{ id: "headerBox" },
	React.createElement(
		"div",
		{ href: "review.html" },
		React.createElement(
			"button",
			{ id: "startReview", onclick: "location.href='review.html';" },
			"Start Review"
		)
	),
	React.createElement(
		"div",
		{ id: "logo" },
		"Lango!"
	)
);

// Another component
function BothCards() {
	return React.createElement(
		"div",
		{ className: "cards" },
		React.createElement(
			"div",
			{ className: "textCard", id: "inputcard" },
			React.createElement("textarea", { "class": "textAreas", onKeyPress: checkReturn, placeholder: "English", id: "input" })
		),
		React.createElement(
			"div",
			{ className: "textCard", id: "outputcard" },
			React.createElement("textarea", { "class": "textAreas", id: "output", placeholder: "Spanish Translation" })
		)
	);
}

function Footer() {
	return React.createElement(
		"div",
		{ "class": "footer" },
		"UserName"
	);
}

function SaveButton() {
	// Create the XHR object.
	function createRequest(method, url) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true); // call its open method
		return xhr;
	}

	function makeSaveRequest(e) {
		e.preventDefault();
		var input = document.getElementById("input").value;

		var output = document.getElementById("output").value;

		document.getElementById('output').value = "";
		document.getElementById('input').value = "";

		var url = "store?english=" + input + "&spanish=" + output;
		var xhr = createRequest('POST', url);
		if (!xhr) {
			alert('CORS not supported');
			return;
		}
		xhr.onload = function () {
			console.log(xhr.responseText);
		};
		xhr.onerror = function () {
			alert('Error');
		};
		xhr.send();
	}

	return React.createElement(
		"button",
		{ onClick: makeSaveRequest, id: "savebutton" },
		"Save"
	);
}
// An element with some contents, including a variable
// that has to be evaluated to get an element, and some
// functions that have to be run to get elements.
var main = React.createElement(
	"main",
	null,
	lango,
	React.createElement(BothCards, null),
	React.createElement(SaveButton, null),
	React.createElement(Footer, null)
);

ReactDOM.render(main, document.getElementById('root'));

// Create the XHR object.
function createRequest(method, url) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true); // call its open method
	return xhr;
}

function makeRequest() {
	console.log('called make request!!!');
	var inputWord = document.getElementById("input").value;

	var url = "translate?english=" + inputWord;

	var xhr = createRequest('GET', url);

	// checking if browser does CORS
	if (!xhr) {
		alert('Not supported');
		return;
	}

	// Load some functions into response handlers.
	xhr.onload = function () {
		var responseStr = xhr.responseText; // get the JSON string

		console.log("AT Flash.js!!: " + responseStr);
		document.getElementById('output').value = responseStr;

		// console.log(JSON.stringify(object, undefined, 2));  // print it out as a string, nicely formatted
	};

	xhr.onerror = function () {
		alert('Woops, there was an error making the request.');
	};

	// Actually send request to server
	xhr.send();
}

// onKeyPress function for the textarea element
// When the charCode is 13, the user has hit the return key

function checkReturn(event) {
	//  console.log(event.charCode);

	if (event.charCode == 13) {
		makeRequest();
	}
}