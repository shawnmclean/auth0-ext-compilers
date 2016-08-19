'use strict';

const Adapter = require('../adapter');
const Authz = require('../authorization');
const Errors = require('../errors');


module.exports = authorize_and_process_body;


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);

        return cb(null, func.length === 3
            ? rawHandler
            : Adapter.wrap(wrappedHandler)
        );


        function rawHandler(ctx, req, res) {
            Authz.is_authorized(ctx, err => {
                if (err) {
                    res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        message: error.message || 'Unkown error',
                        code: error.code || 'unknown_error',
                        statusCode: error.statusCode || 500,
                        stack: error.stack,
                    }));

                    return;
                }

                return func(ctx, req, res);
            });
        }

        function wrappedHandler(ctx, cb) {
            Authz.is_authorized(ctx, err => {
                if (err) return cb(err);

                return func(ctx.body, cb);
            });
        }
    });
}

