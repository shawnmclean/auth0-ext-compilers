'use strict';

module.exports = {
    badRequest: createErrorFactory(400, 'Bad Request', 'bad_request'),
    unauthorized: createErrorFactory(403, 'Unauthorized', 'unauthorized'),
    badImplementation: createErrorFactory(500, 'Bad Implementation', 'bad_implementation'),
};


function createErrorFactory(defaultStatusCode, defaultMessage, defaultCode) {
    return factory;


    function factory(message, options) {
        if (!options) {
            options = {};
        }

        const error = new Error(message || defaultMessage);

        // Make message enumerable
        error.message = message || defaultMessage;
        error.code = options.code || defaultCode;
        error.statusCode = options.statusCode || defaultStatusCode;

        if (options.data) {
            error.data = options.data;
        }

        Error.captureStackTrace(error, factory);

        return error;
    }
}