'use strict';

const Errors = require('./lib/errors');


module.exports = {
    'credentials-exchange': authorize_and_process_body,
};


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);
        return cb(null, function (ctx, cb) {
            if (is_authorized(ctx, cb)) {
                if (typeof ctx.body !== 'object')
                    return cb(Errors.badRequest());
                if (typeof ctx.body.client !== 'object')
                    return cb(Errors.badRequest());
                if (!Array.isArray(ctx.body.scope))
                    return cb(Errors.badRequest());
                if (typeof ctx.body.audience !== 'string')
                    return cb(Errors.badRequest());

                return func(ctx.body.client, ctx.body.scope, ctx.body.audience, cb);
            }
        });
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
