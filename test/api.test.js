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
            script: 'module.exports = function(ctx, cb) { cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            assert.equal(typeof func, 'function');
            assert.equal(func.length, 2);
            done();
        });
    });

    it('success getting, modifying, and returning body (unauthenticated)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler, 
            script: 'module.exports = function(ctx, cb) { ctx.baz = "baz"; cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { foo: 'foo', bar: 'bar' },
                headers: {}
            }, function (error, data) {
                assert.ifError(error);
                assert.ok(data);
                assert.equal(typeof data, 'object');
                assert.equal(data.foo, 'foo');
                assert.equal(data.bar, 'bar');
                assert.equal(data.baz, 'baz');
                assert.equal(Object.keys(data).length, 3);
                done();                
            });
        });
    });

    it('success getting, modifying, and returning body (authenticated)', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler, 
            script: 'module.exports = function(ctx, cb) { ctx.baz = "baz"; cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { foo: 'foo', bar: 'bar' },
                query: { 'auth0-extension-secret': 'foo' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer foo' }
            }, function (error, data) {
                assert.ifError(error);
                assert.ok(data);
                assert.equal(typeof data, 'object');
                assert.equal(data.foo, 'foo');
                assert.equal(data.bar, 'bar');
                assert.equal(data.baz, 'baz');
                assert.equal(Object.keys(data).length, 3);
                done();                
            });
        });
    });

    it('rejects calls without authorization secret', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler, 
            script: 'module.exports = function(ctx, cb) { ctx.baz = "baz"; cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { foo: 'foo', bar: 'bar' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: {}
            }, function (error, data) {
                assert.ok(error);
                assert.equal(data, undefined);
                done();                
            });
        });
    });

    it('rejects calls with wrong authorization secret', function (done) {
        compilers['credentials-exchange']({
            nodejsCompiler, 
            script: 'module.exports = function(ctx, cb) { ctx.baz = "baz"; cb(null, ctx); };'
        }, function (error, func) {
            assert.ifError(error);
            func({
                body: { foo: 'foo', bar: 'bar' },
                secrets: { 'auth0-extension-secret': 'foo' },
                headers: { 'authorization': 'Bearer bar' }
            }, function (error, data) {
                assert.ok(error);
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
