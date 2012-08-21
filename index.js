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
    
    var emit = ev.emit;
    ev.emit = function () {
        if (s.writable) {
            var args = [].slice.call(arguments);
            s.write(args);
        }
        emit.apply(ev, arguments);
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
