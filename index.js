var fs = require('fs'),
  path = require('path'),
  favicon = require('./middleware/favicon'),
  ecstatic = require('ecstatic'),
  plates = require('plates'),
  flatiron = require('../../lib/flatiron'),
  app = flatiron.app;
  

/* ----------- Routes and Files ----------- */

// Union and Director
app.use(flatiron.plugins.http, {
  before: [
    favicon(path.join(__dirname, './favicon.png')),
    ecstatic(__dirname + '/public', {
      cache: 2,
      autoIndex: false
    }),
    // 404s
    function (request, response) {
      var found = app.router.dispatch(request, response);
      if (!found) {
        var data = { 
          'title': '404', 
          'body': 'We are sorry, we could not find <code>' + request.url + '</code>'
        }
        app.render(response, 'index', data, 404);
      }
    },
  ]
});

/* ----------- Templates ----------- */

app.render = function(response, template, data, status) {
  fs.readFile(__dirname + '/plates/' + template + '.html', function(err, html) {
    if (err) {
      response.writeHead(500);
      return response.end('Error loading index.html');
    }
    
    var options = { 
      'title': 'data-bind', 
      'body': 'data-bind'
    }
    var statusCode = status ? status : 200;
    var output = plates.bind(html, data, options);
    
    response.writeHead(statusCode, { 'Content-Type': 'text/html' })
    response.end(output);
  });
}

app.router.get('/', function () {
  var data = { 
    'title': 'home', 
    'body': 'body goes here'
  }
  app.render(this.res, 'index', data);
});

app.router.get('/foo/?', function () {
  var data = { 
    'title': 'foo', 
    'body': 'body goes here'
  }
  app.render(this.res, 'index', data);
});

// app.router.post(/foo/, { stream: true }, function () {
//   var req = this.req,
//       res = this.res,
//       writeStream;
// 
//   writeStream = fs.createWriteStream(Date.now() + '-foo.txt');
//   req.pipe(writeStream);
// 
//   writeStream.on('close', function () {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('wrote to a stream!');
//   });
// });

app.log.info('something');

app.start(8080, function () {
  console.log('flatiron with http running on 8080');
});

