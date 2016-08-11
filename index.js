exports['credentials-exchange'] = authorize_and_process_body;

function authorize_and_process_body(options, cb) {
    options.nodejsCompiler(options.script, function (error, func) {
        if (error) return cb(error);
        return cb(null, function (ctx, cb) {
            if (is_authorized(ctx, cb))
                return func(ctx.body, cb);
        });
    });    
}

function is_authorized(ctx, cb) {
    if (ctx.secrets && ctx.secrets['auth0-extension-secret']) {
        // Authorization is required, enforce
        var match = (ctx.headers['authorization'] || '').trim().match(/^bearer (.+)$/i);
        if (match && match[1] === ctx.secrets['auth0-extension-secret']) return true;
        cb(new Error('Not authorized'));
        return false;
    }
    return true;
}
