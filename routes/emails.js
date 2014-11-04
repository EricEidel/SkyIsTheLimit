exports.send_email = function send_email(to_address, from_address, subject, text_body, html_body)
{
	var api_user = "rmGV3aNaMN";
	var api_key = "5F7C81eo17";
	var sendgrid  = require('sendgrid')(api_user, api_key, {api: 'smtp'});
	
	try 
	{
		sendgrid.send({
	        to:         to_address,
	        from:       from_address,
	        subject:    subject,
	        text:       text_body,
	        html:       html_body
	    }, function(err, json) {
	        if (err) {
	        	res.write("Error:");
	        	res.write(err);
	        }
	        res.write("json:");
	    	res.write(json);
	    });
	} 
	catch(e) 
	{
	    res.write("Error:" + e);
	}
}