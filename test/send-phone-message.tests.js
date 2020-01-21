/* eslint-env node, mocha */

'use strict';

const Assert = require('assert')
const Compilers = require('../index');
const simulate = require('./simulate');
const nodejsCompiler = require('./nodejsCompiler');


describe('send-phone-message', function () {
    const compiler = Compilers['send-phone-message'];

    it('compiles to a function with 3 arguments', function (done) {
        compiler({
            nodejsCompiler,
            script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
        }, function (error, func) {
            Assert.ifError(error);
            Assert.equal(typeof func, 'function');
            Assert.equal(func.length, 3);
            done();
        });
    });

    describe('invalid payload', () => {
        it('rejects when recipient is not set', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: { text: 'dis iz a text', context: {} },
                    headers: {},
                    method: 'POST',
                }, function (error, data) {
                    Assert.ok(error);
                    Assert.equal(error.statusCode, 500);
                    Assert.equal(error.message, 'Body.recipient received by extensibility point is not a string');
                    Assert.equal(data, undefined);
                    done();
                });
            });
        });
        it('rejects when text is not set', function (done) {
            compiler({
                nodejsCompiler,
                script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
            }, function (error, func) {
                Assert.ifError(error);

                simulate(func, {
                    body: { recipient: '1-999-888-657-2134', context: {} },
                    headers: {},
                    method: 'POST',
                }, function (error, data) {
                    Assert.ok(error);
                    Assert.equal(error.statusCode, 500);
                    Assert.equal(error.message, 'Body.text received by extensibility point is not a string');
                    Assert.equal(data, undefined);
                    done();
                });
            });
        });
        describe('context', () => {
            it('rejects context is not an object', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: 'context' },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context received by extensibility point is not an object');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad factor_type', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: { factor_type: 'wrong'} },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.factor_type received by extensibility point is not `first` or `second`');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad message_type', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: { factor_type: 'first', message_type: 'telephone'} },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.message_type received by extensibility point is not `sms` or `voice`');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad action', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                            factor_type: 'first',
                            message_type: 'sms',
                            action: 'wrong'} },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.action received by extensibility point is not `enrollment` or `authentication`');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad language', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                factor_type: 'first',
                                message_type: 'sms',
                                action: 'enrollment',
                                language: {}
                        } },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.language received by extensibility point is not a string');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad ip', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                factor_type: 'first',
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                ip: 127,
                            } },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.ip received by extensibility point is not a string');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad user_agent', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                factor_type: 'first',
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                ip: '127.0.0.1',
                                user_agent: {},

                            } },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.user_agent received by extensibility point is not a string');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad client_id', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                factor_type: 'first',
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                ip: '127.0.0.1',
                                user_agent: 'someAgent',
                                client_id: 123
                            } },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.client_id received by extensibility point is not a string');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });

            it('rejects bad client_id', function (done) {
                compiler({
                    nodejsCompiler,
                    script: 'module.exports = function(recipient, text, context, cb) { cb(); };'
                }, function (error, func) {
                    Assert.ifError(error);

                    simulate(func, {
                        body: { recipient: '1-999-888-657-2134', text: 'dis iz a text', context: {
                                factor_type: 'first',
                                message_type: 'sms',
                                action: 'enrollment',
                                language: 'korean',
                                ip: '127.0.0.1',
                                user_agent: 'someAgent',
                                client_id: 'someId',
                                user: 'harriet'
                            } },
                        headers: {},
                        method: 'POST',
                    }, function (error, data) {
                        Assert.ok(error);
                        Assert.equal(error.statusCode, 500);
                        Assert.equal(error.message, 'Body.context.user received by extensibility point is not an object');
                        Assert.equal(data, undefined);
                        done();
                    });
                });
            });
        });
    });
});
