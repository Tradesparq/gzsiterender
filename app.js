
/**
 * Module dependencies.
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if ( cluster.isMaster ) {
  for ( var i=0; i<numCPUs; ++i )
    cluster.fork();
} else {
  var express = require('express');
  var routes = require('./routes');
  var seo = require('./routes/seo');
  var breadcrumb = require('./routes/breadcrumb');
  var http = require('http');
  var path = require('path');

  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.get('/', routes.index);
  app.get('/SUPPLIERS/:keyword-MANUFACTURERS.html', seo.index);
  app.get('/public/search/supplier_keyword/:ch/:pg', breadcrumb.index);
  app.get('/public/search/supplier_keyword', breadcrumb.index);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}