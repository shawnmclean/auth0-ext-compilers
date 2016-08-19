'use strict';

const Errors = require('./errors');


module.exports = {
    is_authorized,
};


function is_authorized(ctx, cb) {
    if (ctx.secrets && ctx.secrets['auth0-extension-secret']) {
        // Authorization is required, enforce
        var match = (ctx.headers['authorization'] || '').trim().match(/^bearer (.+)$/i);
        if (match && match[1] === ctx.secrets['auth0-extension-secret']) return cb();
        return cb(Errors.unauthorized());
    }
    return cb();
}
