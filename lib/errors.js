'use strict';

module.exports = {
    badRequest: createErrorFactory(400, 'Bad Request', 'bad_request'),
    unauthorized: createErrorFactory(403, 'Unauthorized', 'unauthorized'),
};


function createErrorFactory(defaultStatusCode, defaultMessage, defaultCode) {
    return factory;


    function factory(message, options) {
        if (!options) {
            options = {};
        }

        const error = new Error(message || defaultMessage);

        // Make message enumerable
        error.message = error.message;
        error.code = options.code || 'bad_request';
        error.statusCode = options.statusCode || defaultStatusCode;

        if (options.data) {
            error.data = options.data;
        }

        Error.captureStackTrace(error, factory);

        return error;
    }
}