'use strict';

const Errors = require('./errors');


module.exports = {
    wrap,
};


function wrap(webtaskFn) {
    return handler;


     function handler (ctx, req, res) {
        return webtaskFn(ctx, buildResponse);


        function buildResponse(error, accessToken) {
            var response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: accessToken,
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
    }
}