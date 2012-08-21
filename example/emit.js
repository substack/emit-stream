var emitStream = require('../');
var EventEmitter = require('events').EventEmitter;
var net = require('net');

var server = (function () {
    var ev = createEmitter();
    var s = emitStream(ev);
    
    return net.createServer(function (stream) {
        s.pipe(stream);
    });
})();
server.listen(5555);

server.on('listening', function () {
    var stream = net.connect(5555);
    var ev = emitStream(stream);
    
    ev.on('ping', function (t) {
        console.log('# ping: ' + t);
    });
    
    ev.on('x', function (x) {
        console.log('x = ' + x);
    });
});

function createEmitter () {
    var ev = new EventEmitter;
    setInterval(function () {
        ev.emit('ping', Date.now());
    }, 2000);
    
    var x = 0;
    setInterval(function () {
        ev.emit('x', x ++);
    }, 500);
    
    return ev;
}
