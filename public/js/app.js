var socket = io.connect('http://localhost');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
  jQuery('#body').html('connected')
});
socket.on('disconnect', function () {
  jQuery('#body').html('disconnected')
});