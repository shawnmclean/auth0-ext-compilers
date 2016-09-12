'use strict';

const Adapter = require('../adapter');
const Authz = require('../authorization');
const Boom = require('boom');


module.exports = authorize_and_process_body;


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);

        return cb(null, func.length === 3
            ? rawHandler
            : Adapter.wrap(wrappedHandler)
        );


        function rawHandler(ctx, req, res) {
            Authz.is_authorized(ctx, error => {
                if (error) {
                    if (!error.isBoom) {
                        error = Boom.wrap(error, 500, 'Extensibility point error');
                    }
                    
                    error.output.headers['Content-Type'] = 'application/json';
                    
                    res.writeHead(error.output.statusCode, error.output.headers);
                    res.end(JSON.stringify(error.output.payload));

                    return;
                }

                return func(ctx, req, res);
            });
        }

        function wrappedHandler(ctx, cb) {
            Authz.is_authorized(ctx, err => {
                if (err) return cb(err);

                return func(ctx, cb);
            });
        }
    });
}

