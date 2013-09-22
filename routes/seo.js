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
exports.index = function(req, res, next){
	// Allocate the file to render
	var keyword = req.params.keyword;
	console.log(keyword);
	keyword = keyword.replace(/-/g, ' ');
	keyword = keyword.replace(/(\S)(\S*)/g, function($0,$1,$2){return $1.toUpperCase()+$2.toLowerCase();}); // Upper case only first letter of each word
	var ch = keyword.charAt(0);
	var filepath = 'seo/' + ch + '/' + keyword + '_1.html.gz';

	// Render the file, replacing necessary urls
	raw = fs.readFile(filepath, function(err, gzcontent){
		zlib.gunzip(gzcontent, function(err, content){
			content = content + '';
			for(i in oldSitePatterns){
				var reg = oldSitePatterns[i];
				content = content.replace(reg, function($0, $1){;return newSite + $1;});
			}
			res.send(content);
		});
	});
};