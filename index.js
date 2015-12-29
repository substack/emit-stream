var EventEmitter = require('events');
var through2 = require('through2');

exports = module.exports = function (ev) {
  if (typeof ev.pipe === 'function') {
    return exports.fromStream(ev);
  }
  else return exports.toStream(ev);
};

exports.toStream = function (ev) {
  var s = through2({ objectMode: true },
    function write (args, enc, cb) {
      this.emit('data', args);
      cb();
    },
    function end () {
      console.info('ended');
      var ix = ev._emitStreams.indexOf(s);
      ev._emitStreams.splice(ix, 1);
    }
  );

  if (!ev._emitStreams) {
    ev._emitStreams = [];

    var emit = ev.emit;
    ev.emit = function () {
      var args = [].slice.call(arguments);
      ev._emitStreams.forEach(function (es) {
        if (es.writable) {

          es.write(args);
        } else {

          throw new Error(es, 'is not writable');
        }
      });
      emit.apply(ev, arguments);
    };
  }
  ev._emitStreams.push(s);

  return s;
};

exports.fromStream = function (s) {
  var ev = new EventEmitter();

  s.pipe(through2({ objectMode: true }, function write (args, enc, cb) {
    ev.emit.apply(ev, args);
    cb();
  }));

  return ev;
};
