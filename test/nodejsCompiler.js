'use strict';

module.exports = function nodejsCompiler(script, cb) {
    var func;
    try {
        // For brevity ;-)
        var factory = eval('(function (module) {' + script + '})');
        var m = { exports: {} };
        factory(m);
        func = m.exports;
    }
    catch (e) {
        return cb(e);
    }
    return cb(null, func);
};
