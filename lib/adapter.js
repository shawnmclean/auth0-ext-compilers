'use strict';

const Boom = require('boom');


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
                headers: { },
            }

            if (error) {
                if (!error.isBoom) {
                    error = Boom.wrap(error, 500, 'Extensibility point error');
                }
                
                response.statusCode = error.output.statusCode;
                response.headers = error.output.headers;
                response.data = error.output.payload;
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
            let json;
            
            try {
                json = JSON.stringify(response.data);
            } catch (e) {
                return buildResponse(Boom.badImplementation('Error when JSON serializing the result of the extension point'));
            }
            
            response.headers['Content-Type'] = 'application/json';

            res.writeHead(response.statusCode, response.headers);
            res.end(json);
        }
    }
}