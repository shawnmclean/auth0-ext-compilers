'use strict';

const Assert = require('assert')
const Compilers = require('../index');
const Runtime = require('webtask-runtime');


describe('auth0-ext-compilers', function () {

    it('has generic api', function () {
        Assert.equal(typeof Compilers['generic'], 'function');
    });

    it('has client-credentials-exchange api', function () {
        Assert.equal(typeof Compilers['client-credentials-exchange'], 'function');
    });

});

describe('generic', function () {
    const compiler = Compilers['generic'];

    it('compiles to a function with 2 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { context.body.baz = "baz"; cb(null, context.body); };'
        }, function (error, func) {
            Assert.ifError(error);

            simulate(func, {
                body: { id: 'client' },
                headers: {}
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.id, 'client');
                Assert.equal(data.baz, 'baz');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { context.body.baz = "baz"; cb(null, context.body); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' }
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.id, 'client');
                Assert.equal(data.baz, 'baz');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 401);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(context, cb) { cb(null, context); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { id: 'client' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' }
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 401);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

});


describe('client-credentials-exchange', function () {
    const compiler = Compilers['client-credentials-exchange'];

    it('compiles to a function with 2 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, ctx); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    it('success when scope is undefined (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { client.baz = "baz"; cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);

            simulate(func, {
                body: { client: { id: 'client' }, audience: 'audience' },
                headers: {}
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.equal(typeof data.scope, 'undefined');
                Assert.equal(data.audience, 'audience');
                Assert.equal(Object.keys(data).length, 2);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { client.baz = "baz"; context.hello = "moon"; delete context.webtask; cb(null, { client, scope, audience, context }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience', context: { hello: 'world', foo: 'bar' } },
                headers: {}
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.ok(Array.isArray(data.scope));
                Assert.equal(data.scope.length, 1);
                Assert.equal(data.scope[0], 'scope');
                Assert.equal(data.audience, 'audience');
                Assert.equal(typeof data.context, 'object');
                Assert.equal(data.context.hello, 'moon');
                Assert.equal(data.context.foo, 'bar');
                Assert.equal(Object.keys(data.context).length, 2);
                Assert.equal(Object.keys(data).length, 4);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { client.baz = "baz"; context.hello = "moon"; delete context.webtask; cb(null, { client, scope, audience, context }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience', context: { hello: 'world', foo: 'bar' } },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' }
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(typeof data.client, 'object');
                Assert.equal(data.client.id, 'client');
                Assert.equal(data.client.baz, 'baz');
                Assert.equal(Object.keys(data.client).length, 2);
                Assert.ok(Array.isArray(data.scope));
                Assert.equal(data.scope.length, 1);
                Assert.equal(data.scope[0], 'scope');
                Assert.equal(data.audience, 'audience');
                Assert.equal(typeof data.context, 'object');
                Assert.equal(data.context.hello, 'moon');
                Assert.equal(data.context.foo, 'bar');
                Assert.equal(Object.keys(data.context).length, 2);
                Assert.equal(Object.keys(data).length, 4);
                done();
            });
        });
    });

    it('creates a default, empty context object with the webtask property', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { type: typeof context, length: Object.keys(context).length, webtask: typeof context.webtask }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                headers: { 'authorization': 'Bearer foo' }
            }, function (error, data) {
                Assert.ifError(error);
                Assert.ok(data);
                Assert.equal(typeof data, 'object');
                Assert.equal(data.type, 'object');
                Assert.equal(data.length, 1);
                Assert.equal(data.webtask, 'object');
                Assert.equal(Object.keys(data).length, 3);
                done();
            });
        });
    });

    it('rejects calls with invalid payload', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: 'no good',
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 400);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad client)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: 'client', audience: 'audience' },
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 400);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad scope)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: {}, scope: 'scope', audience: 'audience' },
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 400);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad audience)', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: {}, scope: 'scope', audience: [] },
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 400);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {}
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 401);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, context, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            Assert.ifError(error);
            simulate(func, {
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' }
            }, function (error, data) {
                Assert.ok(error);
                Assert.equal(error.statusCode, 401);
                Assert.equal(data, undefined);
                done();
            });
        });
    });

});

function nodejsCompiler(script, cb) {
    var func;
    try {
        // For brevity ;-)
        var factory = eval('(function (module) {' + script + '})');
        var m = { exports: {} };
        factory(m);
        func = m.exports;
    }
    catch (e) {
        return cb(e);
    }
    return cb(null, func);
}

function simulate(ruleFn, options, cb) {
    const headers = options.headers || {};
    const payload = JSON.stringify(options.body);

    headers['Content-Type'] = 'application/json';

    return Runtime.simulate(ruleFn, { headers, payload, parseBody: true, secrets: options.secrets }, mapResponse);


    function mapResponse(response) {
        const payload = JSON.parse(response.payload);

        if (response.statusCode >= 400) {
            const error = new Error(payload.message);

            error.code = payload.code;
            error.statusCode = payload.statusCode;
            error.stack = payload.stack;

            return cb(error);
        }

        return cb(null, payload);
    }
}