'use strict';

const Errors = require('./lib/errors');


module.exports = {
    'client-credentials-exchange': authorize_and_process_body,
};


function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);
        return cb(null, function (ctx, req, res) {
            if (is_authorized(ctx, cb)) {
                if (typeof ctx.body !== 'object')
                    return cb(Errors.badRequest());
                if (typeof ctx.body.client !== 'object')
                    return cb(Errors.badRequest());
                if (ctx.body.scope && !Array.isArray(ctx.body.scope))
                    return cb(Errors.badRequest());
                if (typeof ctx.body.audience !== 'string')
                    return cb(Errors.badRequest());

                return func(ctx.body.client, ctx.body.scope, ctx.body.audience, buildResponse);
            }


            function buildResponse(error, data) {
                var response = {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/javascript',
                    },
                    data,
                }

                if (error) {
                    response.statusCode = error.statusCode || 500;
                    response.data = {
                        message: error.message || 'Unkown error',
                        code: error.code || 'unknown_error',
                        statusCode: error.statusCode || 500,
                        stack: error.stack,
                    };
                }

                return respond(response);
            }

            function respond(response) {
                try {
                    const body = JSON.stringify(response.data);

                    res.writeHead(response.statusCode, response.headers);
                    res.end(body);
                } catch (e) {
                    return buildResponse(Errors.badImplementation('Error when JSON serializing the result of the extension point'));
                }
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
