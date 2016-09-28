'use strict';

const Adapter = require('../adapter');
const Authz = require('../authorization');


module.exports = clientCredentialsExchange;


function clientCredentialsExchange(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) {
            // Return a wrapped webtask function that will generate an error
            // so that we have a consistent pathway to error reporting
            
            const webtaskFn = (webtaskContext, cb) => {
                error.error_description = error.message;
                error.message = 'Unable to compile the extensibility code as javascript';
                
                return cb(error);
            };
            
            return cb(null, Adapter.wrap(webtaskFn));
        }


        return cb(null, Adapter.wrap(handler));


        function handler (webtaskContext, cb) {
            Authz.is_authorized(webtaskContext, error => {
                if (error) return cb(error);
                
                if (typeof webtaskContext.body !== 'object')
                    return cb(new Error('Body received by extensibility point is not an object'));
                if (typeof webtaskContext.body.client !== 'object')
                    return cb(new Error('Body .client received by extensibility point is not an object'));
                if (webtaskContext.body.scope && !Array.isArray(webtaskContext.body.scope))
                    return cb(new Error('Body .scope received by extensibility point is neither empty nor an array'));
                if (typeof webtaskContext.body.audience !== 'string')
                    return cb(new Error('Body .audience received by extensibility point is not a string'));

                const context = typeof webtaskContext.body.context === 'object'
                    ?   webtaskContext.body.context
                    :   {};
                    
                context.webtask = webtaskContext;

                return func(webtaskContext.body.client, webtaskContext.body.scope, webtaskContext.body.audience, context, cb);
            });
        }
    });
}

