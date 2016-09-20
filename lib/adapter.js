'use strict';

const Boom = require('boom');


module.exports = {
    respondWithError,
    wrap,
};


function respondWithError(error, res) {
    if (!error.isBoom) {
        error = Boom.wrap(error, 500, 'Extensibility point error');
    }
    
    const statusCode = error.output.statusCode;
    const headers = error.output.headers;
    const payload = error.output.payload;
    
    // Convert the boom object's output format to an RFC7807 'predefined' problem
    // See: https://tools.ietf.org/html/rfc7807#section-4.2
    const problem = {
        // type: 'about:blank', // Implicit type uri for a predefined problem
        title: payload.error,
        status: statusCode,
        detail: payload.message,
    };
    
    if (typeof error.data === 'object') {
        for (let key in error.data) {
            if (!problem[key]) {
                problem[key] = error.data;
            }
        }
    }
    
    headers['Content-Type'] = 'application/json';
    
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(problem));
}

function wrap(webtaskFn, payloadAdapter) {
    if (!payloadAdapter) {
        // The default payload adapter is an identity function
        payloadAdapter = payload => payload;
    }

    return handler;


    function handler (ctx, req, res) {
        return webtaskFn(ctx, buildResponse);


        function buildResponse(error /*, arg1, arg2, ...*/) {
            if (error) {
                return respondWithError(error, res);
            }
            
            const response = {
                statusCode: 200,
                headers: { },
                // Marshall the non-error callback arguments into the wire format
                // that the extension <--> auth0-server protocol expects
                data: payloadAdapter.apply(null, Array.prototype.slice.call(arguments, 1)),
            }

            // Currently the respond function assumes json as the only format that
            // will be sent over the wire. In the future we could inspect the request
            // and do applicable content negotiation.
            let json;
            
            try {
                json = JSON.stringify(response.data);
            } catch (e) {
                return respondWithError(Boom.badImplementation('Error when JSON serializing the result of the extension point'), res);
            }
            
            response.headers['Content-Type'] = 'application/json';

            res.writeHead(response.statusCode, response.headers);
            res.end(json);
            
            return;
        }
    }
}