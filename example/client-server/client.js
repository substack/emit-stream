var emitStream = require('../../');
var net = require('net');

var stream = net.connect(5555);
var ev = emitStream(stream);

ev.on('ping', function (t) {
    console.log('# ping: ' + t);
});

ev.on('x', function (x) {
    console.log('x = ' + x);
});
