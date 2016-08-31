'use strict';

const Adapter = require('../adapter');
const Authz = require('../authorization');
const Errors = require('../errors');


module.exports = authorize_and_process_body;


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);


        return cb(null, Adapter.wrap(handler));


        function handler (webtaskContext, cb) {
            Authz.is_authorized(webtaskContext, err => {
                if (err) return cb(err);
                
                if (typeof webtaskContext.body !== 'object')
                    return cb(Errors.badRequest());
                if (typeof webtaskContext.body.client !== 'object')
                    return cb(Errors.badRequest());
                if (webtaskContext.body.scope && !Array.isArray(webtaskContext.body.scope))
                    return cb(Errors.badRequest());
                if (typeof webtaskContext.body.audience !== 'string')
                    return cb(Errors.badRequest());

                const context = typeof webtaskContext.body.context === 'object'
                    ?   webtaskContext.body.context
                    :   {};
                    
                context.webtask = webtaskContext;

                return func(webtaskContext.body.client, webtaskContext.body.scope, webtaskContext.body.audience, context, cb);
            });
        }
    });
}

