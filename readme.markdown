# emit-stream

turn event emitters into streams and streams into event emitters

[![build status](https://secure.travis-ci.org/substack/emit-stream.png)](http://travis-ci.org/substack/emit-stream)

# example

write a server that streams an event emitter's events to clients:

``` js
var emitStream = require('emit-stream');
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
```

then re-constitute the event-emitters on the client:

``` js
var emitStream = require('event-stream');
var net = require('net');

var stream = net.connect(5555);
var ev = emitStream(stream);

ev.on('ping', function (t) {
    console.log('# ping: ' + t);
});

ev.on('x', function (x) {
    console.log('x = ' + x);
});
```

# methods

``` js
var emitStream = require('emit-stream')
```

## emitStream(x)

If `x` is a stream, returns an event emitter from `emit.toStream(x)`.

Otherwise returns a stream from `emit.fromStream(x)`.

## emitStream.toStream(emitter)

Return a stream from the EventEmitter `emitter`.

The arguments are serialized with
[JSONStream](http://github.com/dominictarr/JSONStream).

## emitStream.fromStream(stream)

Return an EventEmitter from `stream`.

The `stream` is parsed with
[JSONStream](http://github.com/dominictarr/JSONStream)
to re-create the event emitter arguments.

# install

With [npm](http://npmjs.org) do:

```
npm install emit-stream
```

# license

MIT
