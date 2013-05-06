var test = require('tap').test;

var emitStream = require('../');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var JSONStream = require('JSONStream');

function JSONStreamServer(createEmitter) {
    var ev;

    var server = net.createServer(function (stream) {
        if (!ev) ev = createEmitter();
        var s = JSONStream.stringify();
        s.pipe(stream);
        emitStream(ev).pipe(s);
    });
    server.on('close', function () { ev.stop && ev.stop() });
    return server;
}


test('emit', function (t) {
    t.plan(1);

    var server = JSONStreamServer(createEmitter);
    server.listen(5555);

    var collected = [];

    server.on('listening', function () {
        var stream = net.connect(5555);
        var ev = emitStream(stream.pipe(JSONStream.parse([true])));

        ev.on('ping', function (t) {
            collected.push('ping');
        });

        ev.on('x', function (x) {
            collected.push(x);
        });

        setTimeout(function () {
            t.same(collected, [
                0, 1, 2, 3, 'ping',
                4, 5, 6, 7, 'ping',
                8, 9, 10, 11, 'ping',
            ]);
            stream.end();
        }, 320);
    });

    t.on('end', function () {
        server.close();
    });
});

function createEmitter () {
    var ev = new EventEmitter;
    var intervals = [];
    ev.stop = function () {
        intervals.forEach(function (iv) { clearInterval(iv) });
    };

    setTimeout(function () {
        intervals.push(setInterval(function () {
            ev.emit('ping', Date.now());
        }, 100));
    }, 5);

    var x = 0;
    intervals.push(setInterval(function () {
        ev.emit('x', x ++);
    }, 25));

    return ev;
}


test('emit to multiple listeners', function(t) {
    t.plan(2);

    var duration = 50, events = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var server = JSONStreamServer(function() {
        return emitLinear(new EventEmitter, 'ping', events, duration);
    });

    server.listen(5555);

    server.on('listening', function() {
        var s1_events = [], s2_events = [];
        var s1_stream, s2_stream;

        plugStream(s1_stream = net.connect(5555)).on('ping', function(x) {
            s1_events.push(x);
        });
        setTimeout(function() {
            s1_stream.end();
        }, duration * 6.5 );

        setTimeout(function() {
            plugStream(s2_stream = net.connect(5555)).on('ping', function(x) {
                s2_events.push(x);
            });
        }, duration * 3.5);

        setTimeout(function() {
            t.same(s1_events, [1, 2, 3, 4, 5, 6]);
            t.same(s2_events, [4, 5, 6, 7, 8, 9, 10]);
            s2_stream.end();
        }, duration * (events.length + 1));
    });


    t.on('end', function() {
        server.close();
    })

});


// helpers

function plugStream(stream) {
    return emitStream(stream.pipe(JSONStream.parse([true])));
};

function emitLinear(ev, event_type, xs, duration) {
    xs = xs.slice().reverse();

    var iv = setInterval(function() {
        xs.length ? ev.emit(event_type, xs.pop()) : clearInterval(iv);
    }, duration);

    return ev;
}

