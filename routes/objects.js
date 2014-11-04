exports.create_account = function create_account()
{
	var client = require("pkgcloud").storage.createClient({
		provider: 'openstack',
		username: '7227afdaeb6e855d3a8c5a807e937146ab18cefe',
		password: 'a67be8d32517fd9662cbcd1904d3383566ce4a6751476293b4897cc2008c',
		authUrl:  'https://swift.ng.bluemix.net/auth/59967a93-2bea-48ea-91c8-74742a5762f9/bb540832-1ce5-4047-a3f9-58dc8f908ed1'
	});
	
	client.getContainers(function(err, containers) {  })
	
	return "abd";
};