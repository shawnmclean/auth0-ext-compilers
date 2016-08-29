'use strict';

const Errors = require('./errors');


module.exports = {
    wrap,
};


function wrap(webtaskFn, payloadAdapter) {
    if (!payloadAdapter) {
        // The default payload adapter is an identity function
        payloadAdapter = payload => payload;
    }

    return handler;


     function handler (ctx, req, res) {
        return webtaskFn(ctx, buildResponse);


        function buildResponse(error /*, arg1, arg2, ...*/) {
            const response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            if (error) {
                response.statusCode = error.statusCode || 500;
                response.data = {
                    message: error.message || 'Unkown error',
                    code: error.code || 'unknown_error',
                    statusCode: error.statusCode || 500,
                    stack: error.stack,
                };
            } else {
                // Marshall the non-error callback arguments into the wire format
                // that the extension <--> auth0-server protocol expects
                response.data = payloadAdapter.apply(null, Array.prototype.slice.call(arguments, 1));
            }

            return respond(response);
        }

        // Currently the respond function assumes json as the only format that
        // will be sent over the wire. In the future we could inspect the request
        // and do applicable content negotiation.
        function respond(response) {
            try {
                const body = JSON.stringify(response.data);

                res.writeHead(response.statusCode, response.headers);
                res.end(body);
            } catch (e) {
                return buildResponse(Errors.badImplementation('Error when JSON serializing the result of the extension point'));
            }
        }
    }
}