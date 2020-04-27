const Adapter = require('../adapter');


module.exports = {
    createCompiler,
};

/**
 * Factory Function to be used internally by Extensibility Points Implementations
 * Creates an extensibility point compiler.
 * Each implementation should provide a handler which is responsible of validating
 * input parameters, authorization and code execution.
 * @param  {Function} handler The Extensibility Point handler
 * @return {Function}         The Extensibility Point Compiler
 */
function createCompiler(handler, addPrelude) {
    /**
     * Extensibility Point Compiler.
     * Receives the webtask code and returns the webtask function to be executed
     * @param  {object}   options The object containing the code and the nodejs Compiler
     * @param  {Function} cb      The callback
     */
    return function extensibilityPointCompiler(options, cb) {
        const script = addPrelude ? addPrelude(options.script) : options.script;

        options.nodejsCompiler(script, function (error, func) {
            if (error) {
                // Return a wrapped webtask function that will generate an error
                // so that we have a consistent pathway to error reporting

                const webtaskFn = (webtaskContext, cb) => {
                    error.error_description = error.message;
                    error.message = 'Unable to compile the extensibility code as javascript';

                    return cb(error);
                };

                return cb(null, Adapter.wrap(webtaskFn));
            }

            // We need to bind the generic handler to the current function
            // to execute
            const handlerWithFunction = handler.bind(null, func);
            return cb(null, Adapter.wrap(handlerWithFunction));
        });
    };
}
