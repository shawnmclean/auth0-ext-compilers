'use strict';

const Runtime = require('webtask-runtime');

module.exports = function simulate(ruleFn, options, cb) {
    const headers = options.headers || {};
    const payload = JSON.stringify(options.body);
    const parseBody = options.parseBody !== false;

    headers['Content-Type'] = 'application/json';

    return Runtime.simulate(ruleFn, { headers, payload, method: options.method, parseBody, secrets: options.secrets }, mapResponse);


    function mapResponse(response) {
        const payload = JSON.parse(response.payload);

        if (response.statusCode >= 400) {
            const error = new Error(payload.message);

            error.title = payload.title;
            error.statusCode = payload.status;
            error.detail = payload.detail;

            for (let key in payload) {
                if (!error[key]) {
                    error[key] = payload[key];
                }
            }
            return cb(error);
        }

        return cb(null, payload);
    }
};
