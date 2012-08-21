var emitStream = require('../../');
var EventEmitter = require('events').EventEmitter;
var net = require('net');

var server = (function () {
    var ev = createEmitter();
    
    return net.createServer(function (stream) {
        emitStream(ev).pipe(stream);
    });
})();
server.listen(5555);

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
