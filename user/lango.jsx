'use strict';

// An element to go into the DOM
const lango = <div id="headerBox">
	<div href="review.html">
	<button id="startReview" onclick="location.href='review.html';">Start Review</button>

	</div>

	<div id="logo">Lango!</div>

	</div>;


// Another component
function BothCards() {
	return (<div className='cards'>
		<div className="textCard" id="inputcard">
			<textarea class ="textAreas" onKeyPress={checkReturn} placeholder="English" id="input" />
		</div>
		<div className="textCard" id="outputcard" >
			<textarea class ="textAreas" id="output" placeholder="Spanish Translation" />
		</div>
		</div>);
}

function Footer() {
	return (<div class='footer'>
		UserName
		</div>)
}

function SaveButton() {
	// Create the XHR object.
	function createRequest(method, url) {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url, true);  // call its open method
		return xhr;
	}

	function makeSaveRequest(e) {
		e.preventDefault();
		let input = document.getElementById("input").value;
		let output = document.getElementById("output").value;
		document.getElementById('output').value = "";
	document.getElementById('input').value = "";

		let url = "store?english="+input+"&spanish="+output;
		let xhr = createRequest('POST', url);
		if(!xhr){
			alert('CORS not supported');
			return;
		}
		xhr.onload = function() {
			console.log(xhr.responseText);
		}
		xhr.onerror = function() {
			alert('Error');
		}
		xhr.send();
	  }
	return (<button onClick={makeSaveRequest} id="savebutton">
			Save
		</button>);
}
const main = (<main>
		{lango}
	      	<BothCards/>
	      	<SaveButton/>
			<Footer/>
	    </main>
);
ReactDOM.render(
    main,
    document.getElementById('root')
);
function createRequest(method, url) {
	let xhr = new XMLHttpRequest();
	xhr.open(method, url, true);  // call its open method
	return xhr;
}
function makeRequest() {
    console.log('called make request!!!');
    let inputWord = document.getElementById("input").value;

    let url = "translate?english=" + inputWord;

    let xhr = createRequest('GET', url);

    // checking if browser does CORS
    if (!xhr) {
        alert('Not supported');
        return;
    }
    xhr.onload = function () {
        let responseStr = xhr.responseText;  // get the JSON string
        console.log("AT Flash.js!!: " + responseStr);
        document.getElementById('output').value = responseStr;

    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };
    xhr.send();
}
function checkReturn(event) {
	if (event.charCode == 13) {
		makeRequest()
	}
}
