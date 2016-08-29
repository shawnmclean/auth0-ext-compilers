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
                if (typeof ctx.body !== 'object')
                    return cb(Errors.badRequest());
                if (typeof ctx.body.client !== 'object')
                    return cb(Errors.badRequest());
                if (ctx.body.scope && !Array.isArray(ctx.body.scope))
                    return cb(Errors.badRequest());
                if (typeof ctx.body.audience !== 'string')
                    return cb(Errors.badRequest());
                    
                const context = typeof ctx.body.context !== 'object'
                    ?   ctx.body.context
                    :   {};

                return func(ctx.body.client, ctx.body.scope, ctx.body.audience, context, cb);
            }
        }
    });
}

