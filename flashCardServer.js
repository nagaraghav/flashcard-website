const express = require('express')
const passport = require('passport');
const cookieSession = require('cookie-session');
const GoogleStrategy = require('passport-google-oauth20');
const sqlite3 = require("sqlite3").verbose();  // use sqlite


const port = 56026 // you need to put your port number here

const googleLoginData = {
    clientID: '485452707242-3tdfkcmb7rrl3liefhp1j5uomjfk3263.apps.googleusercontent.com',
    clientSecret: 'xy1VhLFUFtA1tAnmCp2nbExK',
    callbackURL: '/auth/redirect'
};



const fs = require("fs"); // file system
const dbFileName = "Flashcards.db";
// makes the object that represents the database in our code
const db = new sqlite3.Database(dbFileName);  // object, not database.



const APIrequest = require('request');
const http = require('http');

const APIkey = "AIzaSyBHUzNBR-HobYiEwt4GOmIofClJQIrwiI8";  // ADD API KEY HERE
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey

let reqObj =
    {
  "source": "en",
  "target": "es",
  "q": ""
    }

passport.use( new GoogleStrategy(googleLoginData, gotProfile) );

// put together the server pipeline
const app = express()
// Public static files
app.use('/', printURL);

// otherwise not found
app.use(cookieSession({
maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
// meaningless random string used by encryption
keys: ['hanger waldo mercy dance']
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
passport.authenticate('google',{ scope: ['profile'] }));
app.get('/auth/redirect',
  	// for educational purposes
  	function (req, res, next) {
  	    console.log("at auth/redirect");
  	    next();
  	},
  	// This will issue Server's own HTTPS request to Google
  	// to access the user's profile information with the
  	// temporary key we got in the request.
  	passport.authenticate('google'),
  	// then it will run the "gotProfile" callback function,
  	// set up the cookie, call serialize, whose "done"
  	// will come back here to send back the response
  	// ...with a cookie in it for the Browser!
  	function (req, res) {
  	    console.log('Logged in and using cookies!')
  	    res.redirect('/user/lango.html');
  	});
    // static files in /user are only available after login
app.get('/user/*',
    	isAuthenticated, // only pass on to following function if
    	// user is logged in
    	// serving files that start with /user from here gets them from ./
    	express.static('.')
   );
app.get('/*',express.static('public'));
app.get('/user/translate', translateHandler);   // if not, is it a valid query?
app.post('/user/store', saveFlashcard);


app.use(fileNotFound);


app.listen(port, function () { console.log('Listening ... http://server162.site:56026/loginPage.html'); })


function isAuthenticated(req, res, next) {
    if (req.user) {
	console.log("Req.session:",req.session);
	console.log("Req.user:",req.user);
	next();
    } else {
	res.redirect('/login.html');  // send response telling
	// Browser to go to login page
    }
}

function translateHandler(req, res, next) {
    console.log('Changed server file!!');
    let url = req.url;
    let qObj = req.query;
    console.log(qObj.english);

    reqObj.q = qObj.english;
    if (qObj.english != undefined) {
        translate(res)
    }
    if(res != undefined){
    }
    else {
        next();
    }

}

function saveFlashcard(req, res, next){


  let url = req.url;
  let qObj = req.query;
  let input = qObj.english;
  let output = qObj.spanish;


  console.log("At database function: : " + qObj.english + " " +  qObj.spanish);


  if(input != undefined){
      let cmdStr = 'INSERT into Flashcards  VALUES(?,?,?,0,0)';
      db.run(cmdStr, [req.user.googleid, input, output], insertCallback);
      res.send("Successfully inserted.");
    }
    else {
      next();
    }

}

// print the url of incoming HTTP request
function printURL (req, res, next) {
    console.log(req.url);
    next();
}

function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find ' + url);
}

function translate(res) {

      // callback function, called when data is received from API
  function APIcallback(err, APIresHead, APIresBody) {
  	// gets three objects as input
  	if ((err) || (APIresHead.statusCode != 200)) {
  	    // API is not working
  	    console.log("Got API error");
  	    console.log(APIresBody);
  	} else {
  	    if (APIresHead.error) {
  		// API worked but is not giving you data
  		console.log(APIresHead.error);
  	    } else {

      res.send(APIresBody.data.translations[0].translatedText);
  		console.log("\n\nJSON was:");
  		console.log(JSON.stringify(APIresBody, undefined, 2));


  		// print it out as a string, nicely formatted

  	    }
  	}
      } // end callback function

        APIrequest(
        	{ // HTTP header stuff
        	    url: url,
        	    method: "POST",
        	    headers: {"content-type": "application/json"},
        	    // will turn the given object into JSON
        	    json: reqObj	},
        	// callback function for API request

        	APIcallback
            );

}

function insertCallback(err){
  if(err){
    console.log('Error: ', err);
  }
  else{
    console.log('Successfully inserted.');
    dumpDB();
  }
}

function gotProfile(accessToken, refreshToken, profile, done) {
    console.log("Raghav - Google profile",profile.id);

    let select = 'SELECT * FROM Users WHERE googleid = ?';
    let googleid = profile.id;
    let firstname = profile.name.givenName;
    let lastname = profile.name.familyName;

    console.log("Information!!!: " + googleid + ", " + lastname  + ", " + firstname);

    db.run(select, [googleid], (err, rows) => {
  	if(err) {
  		console.log("Profile error", err);

  	}
  	if(!rows){
      console.log("USER NOT FOUND SO Inserting one now");
  		let insert = 'INSERT INTO Users (googleid, firstname, lastname) VALUES(?, ?, ?)';
  		db.run(insert, [googleid, firstname, lastname], insertCallback);
  		let dbRowID = googleid;
  		done(null, dbRowID);
  	}
  	else{
  		let dbRowID = googleid;
  		done(null, dbRowID);
  	}
    });
    dumpDB();


}


// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
passport.serializeUser((dbRowID, done) => {
    console.log("Raghav - SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie.
// Where we should lookup user database info.
// Whatever we pass in the "done" callback becomes req.user
// and can be used by subsequent middleware.
passport.deserializeUser((dbRowID, done) => {
    console.log("Raghav - deserializeUser. Input is:", dbRowID);

    let select = 'SELECT * FROM Users WHERE googleid = ?';

	   db.get(select, [dbRowID], (err, row) => {

		if (err) {
		  console.log("deserializeUser ERror", err);

		}
		if(row){

			let user = {
				googleid: row.googleid,
				firstname: row.firstname,
				lastname: row.lastname,
        			rowID: 0
			};
			done(null, user);
		}
	})



});

function dumpDB() {

  db.all ( 'SELECT * FROM Flashcards', dataCallback);
  db.all( 'SELECT * FROM Users', dataCallback);
  function dataCallback( err, data ) {console.log(data)}
}
