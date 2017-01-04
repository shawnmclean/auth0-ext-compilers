'use strict';

const Wreck = require('wreck');


module.exports = {
    respondWithError,
    wrap,
};


function respondWithError(error, res) {
    if (!(error instanceof Error)) {
        error = new Error(error.message || String(error) || 'Unknown error')
    }
    
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    
    const statusCode = error.statusCode;
    const headers = {
        'Content-Type': 'application/json',
    };
    const payload = {
        message: error.message,
        statusCode: error.statusCode,
    };
    
    ['code', 'errno', 'error', 'error_description', 'data']
        .forEach(key => {
            if (error[key]) payload[key] = error[key];
        });
    
    if (error.statusCode === 500 && error.stack) {
        payload.stack = error.stack;
    }
    
    let json;
    
    try {
        json = JSON.stringify(payload);
    } catch (e) {
        const error = new Error('Error serializing error: ' + e.message);
        error.statusCode = 500;
        
        return respondWithError(error, res);
    }
    
    res.writeHead(statusCode, headers);
    res.end(json);
}

function wrap(webtaskFn, payloadAdapter) {
    if (!payloadAdapter) {
        // The default payload adapter is an identity function
        payloadAdapter = payload => payload;
    }

    const bodylessMethods = ['GET', 'HEAD', 'OPTIONS'];

    return handler;


    function handler (ctx, req, res) {
        // There will be no body to parse.
        if (bodylessMethods.indexOf(req.method) !== -1) {
            return webtaskFn(ctx, buildResponse);
        }

        // The body has already been parsed before control is handed over to the compiler.
        // This means that the platform already did the parsing.
        if (ctx.body) {
            return webtaskFn(ctx, buildResponse);
        }

        // The body has yet to be parsed. Delegate this logic to wreck.
        return Wreck.read(req, { json: true }, (error, body) => {
            if (error) {
                return buildResponse(error);
            }

            ctx.body = body;

            return webtaskFn(ctx, buildResponse);
        });


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
                return respondWithError(new Error('Error when JSON serializing the result of the extension point'), res);
            }
            
            response.headers['Content-Type'] = 'application/json';

            res.writeHead(response.statusCode, response.headers);
            res.end(json);
            
            return;
        }
    }
}