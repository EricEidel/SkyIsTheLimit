/*jslint node:true*/
/*eslint no-unused-params:0*/
/* These lines are hints to the code editor */

/**
 * Load the appropriate modules for our web application
*/
var http = require('http');
var path = require('path');
var express = require('express');   // The ExpressJS framework
var cookieParser = require('cookie-parser');
var express_session = require('express-session'); 
var bodyParser = require('body-parser');
var morgan  = require('morgan');    // For clearing logging messages
var ibmdb = require('ibm_db');

var database = require('./routes/database');
var emails = require('./routes/emails');

// This part finds the env and the key parameters from the VCAP_SERVICES. Looks like a lot, but very similar to what we did before.
var serviceName = 'SQLDB';

/*
 * Recursively iterate through the object looking for the key, 
 * return the index
 */
function findKey(obj,lookup) 
{
   for (var i in obj) 
   {
      if (typeof(obj[i])==="object") 
      {
         if (i.toUpperCase().indexOf(lookup) > -1) 
         {
            // Found the key
            return i;
         }
         findKey(obj[i],lookup);
      }
   }
   return -1;
}

var env = null;
var key = -1;

// Look for an entry in the VCAP_SERVICES environment variable that has 
// the serviceName string in it
if (process.env.VCAP_SERVICES) 
{
   env = JSON.parse(process.env.VCAP_SERVICES);
   key = findKey(env,serviceName);
}

var credentials = env[key][0].credentials;
var dsnString = "DRIVER={DB2};DATABASE=" + credentials.db + ";UID=" + credentials.username + ";PWD=" + credentials.password + ";HOSTNAME=" + credentials.hostname + ";port=" + credentials.port;  

/**
 * Setup the Express engine
**/
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// App.use
app.use(morgan('dev'));
app.use(cookieParser()); // Needed for the session part to work
app.use(express_session({secret: 'OMG_bigSecretL33tz0rs', resave: true,	saveUninitialized: true})); // Define a session framework with a "secret"
app.use(express.static(path.join(__dirname, 'public'))); // Makes all the content in "public" accessible
app.use( bodyParser.json() );       // to support JSON-encoded bodies ( {"name":"foo","color":"red"} <- JSON encoding )
app.use( bodyParser.urlencoded({ extended: true }) ); // to support URL-encoded bodies ( name=foo&color=red <- URL encoding )

// Use this function as a middleware to verify the user is logged in. 
function is_logged_in(req, res, next)
{
	if (req.session.user == null)
	{
		res.redirect('/');
	}
	else
	{
		next();
	}
}

app.get('/', function(req,res)
{
	var is_user_logged_in = (req.session.user != null);
	var username = "";
	
	if (req.session.user)
	{
		username = req.session.user;
		res.render('home', {user_logged_in: is_user_logged_in, username : username});
	}
	else
	{
		res.render('log_in', {user_logged_in: is_user_logged_in, username : username});
	}
});

app.get('/log_in', function(req,res)
{
	var is_user_logged_in = (req.session.user != null);
	if (!is_user_logged_in)
	{
		res.render('log_in', {user_logged_in: is_user_logged_in, username : ""});
	}
	else 
	{
		res.redirect('/home');
	}
});


/*
app.get('/send_email', function(req,res)
{
	var from_address = "eidelber@ca.ibm.com";
	var to_address = "eidelber@ca.ibm.com";
	
	var subject = "Hello!";
	var text_body = "Hello.";
	
	// HTML BODY
	var html_body = "<p>Note to myself.</p>";
	emails.send_email(to_address, from_address, subject, text_body, html_body);	
});
*/

app.post('/log_in', function(req,res)
{
	var username = req.body.username;
	var password = req.body.password;
	
	res.redirect('/home');
});

app.get('/log_out', is_logged_in, function(req,res)
{
	req.session.user = null;
	res.redirect('/');
});

app.post('/post_form_appl', function(req, res)
{
	var contact_name = req.body.contact_name;
	var email = req.body.email;
	var password = req.body.password;
	
	var organization_name = req.body.organization_name;
	var charity_number = req.body.charity_number;
	var address = req.body.address;
	var phone_number = req.body.phone_number;
	
	var org_website = req.body.org_website;
	var mission = req.body.mission;
	var history = req.body.history;
	var program = req.body.program;
	var target_population = req.body.target_population;
	var accomplishments = req.body.accomplishments;
	
	var low = 1000000;
	var high = 100000000000;
	
	var verification_num = Math.random() * (high - low) + low;
	
	var InsertStatement = "insert into SKY.USER " +
	 		"( name, password, email, access_level, verification) values ('" +
	 		contact_name + "','" + password + "','" + email + "'," + 2 + "," + verification_num + ")";
	 		
	res.write(InsertStatement);
		 	
	var tables = database.send_query(ibmdb, dsnString, InsertStatement);
	res.write("<br/>" + tables);
	
	var from_address = "OMG-An-Awesome@email.com";
	var to_address = email;
	
	var subject = "Please verify your account.";
	var text_body = "Please verify your account at http://skyisthelimit.mybluemix.net/activate . Your code is: " + verification_num;
	
	// HTML BODY
	var html_body = "<p>Please verify your account at <a href='http://skyisthelimit.mybluemix.net/activate'>this page</a>. Your activation code is <b>" + verification_num + "</b></p>";
	emails.send_email(to_address, from_address, subject, text_body, html_body);
	
	res.end();
});

app.get('/activate', function(req, res)
{
	res.render('verify');
});

app.post('/activate', function(req, res)
{
		var email = req.body.email;
		var number = req.body.number;
		var sql = "SELECT * WHERE (email='"+ email +"' AND verification_num='" + number + "';" ;		
		
		var tables = database.send_query(ibmdb, dsnString, sql);
		res.write("<br/>" + tables);
		
		if (tables)
		{
			res.write("SUCCESS!");
		}
		else
		{
			res.write("FAIL!");
		}
});

app.get('/get_form_appl', function(req, res)
{
	res.render('request_application');
});

app.post('/post_form_appl', function(req, res)
{
	var amount = req.body.amount;
	var no_computers = req.body.no_computers;
	var extra_info = req.body.extra_info;
	var status = 0;
	var user_id = 1;
	var worked_by = "NULL";
	var time_submitted = "CURRENT TIMESTAMP";
	
	var InsertStatement = "insert into SKY.APPLICATIONS " +
		 		"( user_id, amount, no_computers, extra_info, status, worked_by_id, time_submitted ) values ( " +
		 		user_id + ",'" + amount + "','" + no_computers + "','" + extra_info + "'," + status + "," +
		 		worked_by + "," + time_submitted + " )";
		 	
 	res.write(InsertStatement);
		 	
	var tables = database.send_query(ibmdb, dsnString, InsertStatement);
	res.write("<br/>" + tables);
	res.end();
});

/**
 * This is where the server is created and run.  Everything previous to this
 * was configuration for this server.
**/
var server = http.createServer(app);
server.listen(app.get('port'), function(){
   console.log('Express server listening on port ' + app.get('port'));
});



