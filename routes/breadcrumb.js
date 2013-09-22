var fs = require('fs');
var zlib = require('zlib');

var oldSite = 'www.tradesparq.com';
var newSite = 'localhost:3000';

var oldSitePatterns = [
	new RegExp(oldSite + '(/SUPPLIERS/[A-Z])', 'g'),
	new RegExp(oldSite + '(/stylesheets/)', 'g'),
	new RegExp(oldSite + '(/images/)', 'g'),
	new RegExp(oldSite + '(/user2)', 'g'),
	new RegExp(oldSite + '(/public/search/supplier_keyword)', 'g'),
	new RegExp(oldSite + '(/uploads/)', 'g')
];

/**
 * Serve the SEO pages from the gz files.
 */
exports.index = function(req, res){
	var ch = req.params.ch;
	if(!ch) ch = 'a';
	// Render the file, replacing necessary urls
	raw = fs.readFile('breadcrumb/' + ch.toLowerCase(), function(err, content){
		content = content + '';
		for(i in oldSitePatterns){
			var reg = oldSitePatterns[i];
			content = content.replace(reg, function($0, $1){;return newSite + $1;});
		}
		res.send(content);
	});
};