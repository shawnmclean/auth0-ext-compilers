'use strict';

const Authz = require('../authorization');
const Factory = require('./compilerFactory');

class BaseError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
    }
}

class InvalidRequestError extends BaseError {
    constructor(code, message) {
        super(code, message);
    }
}

class InvalidScopeError extends BaseError {
    constructor(code, message) {
        super(code, message);
    }
}

class ServerError extends BaseError {
    constructor(code, message) {
        super(code, message);
    }
}

const ERROR_TO_RESULT_MAP =  {
    [InvalidRequestError.name]: (err) => ({
        result: 'oauth_error',
        data: {
            error: 'invalid_request',
            error_code: err.code,
            error_description: err.message
        }
    }),
    [InvalidScopeError.name]: (err) => ({
        result: 'oauth_error',
        data: {
            error: 'invalid_scope',
            error_code: err.code,
            error_description: err.message
        }
    }),
    [ServerError.name]: (err) => ({
        result: 'oauth_error',
        data: {
            error: 'server_error',
            error_code: err.code,
            error_description: err.message
        }
    })
};

const PRELUDE_ITEMS = [
    BaseError,
    InvalidRequestError,
    InvalidScopeError,
    ServerError
];

function mapError(err) {
    const resultFunc = ERROR_TO_RESULT_MAP[err.name];

    if(resultFunc) return resultFunc(err);

    return { result: "user_error", data: err };
}

module.exports = Factory.createCompiler(clientCredentialsExchangeHandler, PRELUDE_ITEMS);

function clientCredentialsExchangeHandler (func, webtaskContext, cb) {
    return Authz.is_authorized(webtaskContext, error => {
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

        function wrappedCallback(err, data) {
            if(err) {
                return cb(null, mapError(err));
            }

            cb(null, { result: "success", data });
        }

        return func(webtaskContext.body.client, webtaskContext.body.scope, webtaskContext.body.audience, context, wrappedCallback);
  });
}
