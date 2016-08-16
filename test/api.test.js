var assert = require('assert')
var compilers = require('../index');

describe('auth0-ext-compilers', function () {

    it('has credentials-exchange api', function () {
        assert.equal(typeof compilers['credentials-exchange'], 'function');
    });

});

describe('credentials-exchange', function () {

    it('compiles to a function with 2 arguments', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            assert.equal(typeof func, 'function');
            assert.equal(func.length, 2);
            done();
        });
    });

    it('success when scope is undefined (unauthenticated)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { client.baz = "baz"; cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: { id: 'client' }, audience: 'audience' },
                headers: {}
            }, function (error, data) {
                assert.ifError(error);
                assert.ok(data);
                assert.equal(typeof data, 'object');
                assert.equal(typeof data.client, 'object');
                assert.equal(data.client.id, 'client');
                assert.equal(data.client.baz, 'baz');
                assert.equal(Object.keys(data.client).length, 2);
                assert.equal(typeof data.scope, 'undefined');
                assert.equal(data.audience, 'audience');
                assert.equal(Object.keys(data).length, 3);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { client.baz = "baz"; cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                headers: {}
            }, function (error, data) {
                assert.ifError(error);
                assert.ok(data);
                assert.equal(typeof data, 'object');
                assert.equal(typeof data.client, 'object');
                assert.equal(data.client.id, 'client');
                assert.equal(data.client.baz, 'baz');
                assert.equal(Object.keys(data.client).length, 2);
                assert.ok(Array.isArray(data.scope));
                assert.equal(data.scope.length, 1);
                assert.equal(data.scope[0], 'scope');
                assert.equal(data.audience, 'audience');
                assert.equal(Object.keys(data).length, 3);
                done();
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { client.baz = "baz"; cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                query: { 'auth0-extension-secret': 'foo' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' }
            }, function (error, data) {
                assert.ifError(error);
                assert.ok(data);
                assert.equal(typeof data, 'object');
                assert.equal(typeof data.client, 'object');
                assert.equal(data.client.id, 'client');
                assert.equal(data.client.baz, 'baz');
                assert.equal(Object.keys(data.client).length, 2);
                assert.ok(Array.isArray(data.scope));
                assert.equal(data.scope.length, 1);
                assert.equal(data.scope[0], 'scope');
                assert.equal(data.audience, 'audience');
                assert.equal(Object.keys(data).length, 3);
                done();
            });
        });
    });

    it('rejects calls with invalid payload', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: 'no good',
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad client)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: 'client', audience: 'audience' },
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad scope)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: {}, scope: 'scope', audience: 'audience' },
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with invalid payload (bad audience)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: {}, scope: 'scope', audience: [] },
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 400);
                assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 403);
                assert.equal(data, undefined);
                done();
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler,
            script: 'module.exports = function(client, scope, audience, cb) { cb(null, { client, scope, audience }); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { client: { id: 'client' }, scope: ['scope'], audience: 'audience' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' }
            }, function (error, data) {
                assert.ok(error);
                assert.equal(error.statusCode, 403);
                assert.equal(data, undefined);
                done();
            });
        });
    });

});

function nodejsCompiler(script, cb) {
    var func;
    try {
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
