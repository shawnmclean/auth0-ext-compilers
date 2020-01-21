'use strict';

const Authz = require('../authorization');
const Factory = require('./compilerFactory');

module.exports = Factory.createCompiler(sendPhoneMessageHandler);

function sendPhoneMessageHandler (func, webtaskContext, cb) {
    return Authz.is_authorized(webtaskContext, error => {
        if (error) return cb(error);

        if (typeof webtaskContext.body !== 'object')
            return cb(new Error('Body received by extensibility point is not an object'));

        if (typeof webtaskContext.body.recipient !== 'string') {
            return cb(new Error('Body.recipient received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.text !== 'string') {
            return cb(new Error('Body.text received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context !== 'object') {
            return cb(new Error('Body.context received by extensibility point is not an object'));
        }
        if (webtaskContext.body.context.factor_type !== ('first' || 'second')) {
            return cb(new Error('Body.context.factor_type received by extensibility point is not `first` or `second`'));
        }
        if (webtaskContext.body.context.message_type !== ('sms' || 'voice')) {
            return cb(new Error('Body.context.message_type received by extensibility point is not `sms` or `voice`'));
        }
        if (webtaskContext.body.context.action !== ('enrollment' || 'authentication')) {
            return cb(new Error('Body.context.action received by extensibility point is not `enrollment` or `authentication`'));
        }
        if (typeof webtaskContext.body.context.language !== 'string') {
            return cb(new Error('Body.context.language received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.ip !== 'string') {
            return cb(new Error('Body.context.ip received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.user_agent !== 'string') {
            return cb(new Error('Body.context.user_agent received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.client_id !== 'string') {
            return cb(new Error('Body.context.client_id received by extensibility point is not a string'));
        }
        if (typeof webtaskContext.body.context.user !== 'object') {
            return cb(new Error('Body.context.user received by extensibility point is not an object'));
        }

        return func(webtaskContext.body.recipient, webtaskContext.body.text, webtaskContext.body.context, cb);
    });
}
