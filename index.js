var EventEmitter = require('events').EventEmitter;
var JSONStream = require('JSONStream');

exports = module.exports = function (ev) {
    if (typeof ev.pipe === 'function') {
        return exports.fromStream(ev);
    }
    else return exports.toStream(ev)
};

exports.toStream = function (ev) {
    var s = JSONStream.stringify();
    
    if (!ev._emitStreams) {
        ev._emitStreams = [];
        
        var emit = ev.emit;
        ev.emit = function () {
            if (s.writable) {
                var args = [].slice.call(arguments);
                ev._emitStreams.forEach(function (es) {
                    es.write(args);
                });
            }
            emit.apply(ev, arguments);
        };
    }
    ev._emitStreams.push(s);
    
    var end = s.end;
    s.end = function () {
        var ix = ev._emitStreams.indexOf(s);
        ev._emitStreams.splice(ix, 1);
        end.apply(s, arguments);
    };
    
    return s;
};

exports.fromStream = function (s) {
    var ev = new EventEmitter;
    
    var p = JSONStream.parse([ true ]);
    p.on('data', function (args) {
        ev.emit.apply(ev, args);
    });
    s.pipe(p);
    
    return ev;
};
