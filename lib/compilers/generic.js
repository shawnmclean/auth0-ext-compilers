'use strict';

const Adapter = require('../adapter');
const Authz = require('../authorization');
const Errors = require('../errors');


module.exports = authorize_and_process_body;


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);


        return cb(null, Adapter.wrap(handler));


        function handler (ctx, cb) {
            if (Authz.is_authorized(ctx, cb)) {
                return func(ctx.body, cb);
            }
        }
    });
}

