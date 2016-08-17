'use strict';

const Adapter = require('./adapter');
const Errors = require('./errors');


module.exports = authorize_and_process_body;


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);


        return cb(null, Adapter.wrap(handler, accessToken => accessToken));


        function handler (ctx, cb) {
            if (is_authorized(ctx, cb)) {
                if (typeof ctx.body !== 'object')
                    return cb(Errors.badRequest());
                if (typeof ctx.body.client !== 'object')
                    return cb(Errors.badRequest());
                if (ctx.body.scope && !Array.isArray(ctx.body.scope))
                    return cb(Errors.badRequest());
                if (typeof ctx.body.audience !== 'string')
                    return cb(Errors.badRequest());

                return func(ctx.body.client, ctx.body.scope, ctx.body.audience, cb);
            }

        }
    });
}

function is_authorized(ctx, cb) {
    if (ctx.secrets && ctx.secrets['auth0-extension-secret']) {
        // Authorization is required, enforce
        var match = (ctx.headers['authorization'] || '').trim().match(/^bearer (.+)$/i);
        if (match && match[1] === ctx.secrets['auth0-extension-secret']) return true;
        cb(Errors.unauthorized());
        return false;
    }
    return true;
}
