var fs = require('fs'),
  path = require('path'),
  sys = require('util'),
  // favicon = require('./middleware/favicon'),
  ecstatic = require('ecstatic'),
  plates = require('plates'),
  flatiron = require('flatiron'),
  restler = require('./vendor/restler'),
  app = flatiron.app;
  

/* ----------- Routes and Files ----------- */

// Union and Director
app.use(flatiron.plugins.http, {
  before: [
    // favicon(path.join(__dirname, './favicon.png')),
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

/* ----------- Timer ----------- */

// Just sets an interval with the given time (ms) and a callback
app.timer = function(interval, callback){
  app.t = setInterval(function(){
    if (callback) {
      callback.call(this);
    }
  }, interval);
}





app.router.get('/', function () {
  var data = { 
    'title': 'home', 
    'body': ''
  }
  app.render(this.res, 'index', data);
});

app.router.get('/foo/?', function () {
  var data = { 
    'title': 'foo', 
    'body': ''
  } 
  app.render(this.res, 'index', data);
});


/* ----------- RestFUL interface ----------- */

app.get_remote_url = function(url, socket){
  restler.get(url).on('complete', function(data, response) {
    if(response.statusCode != status){
      status = 200;
      app.broadcast_status(socket, url, status);
    }
  }).on('error', function(data, response) {
    status = 503;
    app.broadcast_status(socket, url, status);
  });
}

app.broadcast_status = function(socket, url, status){
  var time = new Date();
  socket.broadcast.emit('news', {
    clients: activeClients,
    time: time.getSeconds(),
    url: url,
    status: status
  });
  time = null;
}

app.start(8080, function () {
  console.log('flatiron with http running on 8080');
});

var io = require('socket.io').listen(app.server);
var activeClients = 0;
var url = 'http://software-training.heroku.com/';
var status = 200;

io.sockets.on('connection', function(socket) {
  activeClients +=1;
  
  // clearInterval(app.t);
  app.timer(10000, function(){
    app.get_remote_url(url, socket)
  });

  app.get_remote_url(url, socket)
  restler.get(url).on('complete', function(data, response) {
    var time = new Date();
    status = response.statusCode;
    socket.emit('news', {
      clients: activeClients,
      time: time.getSeconds(),
      url: url,
      status: status
    });
  });
  // socket.emit('news', {hello: 'mars'});
  // socket.on('my other event', function(data) {
  //   console.log(data);
  // });
});

