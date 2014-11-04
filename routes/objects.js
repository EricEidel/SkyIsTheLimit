exports.create_account = function create_account()
{
	var https = require('https');

	var options = {
		host:    'swift.ng.bluemix.net',
		path:    'auth/59967a93-2bea-48ea-91c8-74742a5762f9/bb540832-1ce5-4047-a3f9-58dc8f908ed1/user',
		headers: { 'Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=' },
		method:  'GET'
	};
	
	var req = https.request(options, function(res) {
		var str = '';
	
		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			res.write(chunk);
		});
	
		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
			res.write(str);
		});
	});
	req.end();
	
	req.on('error', function(err) {
		res.write("Error: " + err);
	});
}