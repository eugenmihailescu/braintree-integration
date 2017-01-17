"use strict";
/**
 * A prototype of a generic class that accepts a configuration object which can register a various number of external modules
 * that the class may use.
 * 
 * @param config
 *            An object that is expected to contain a `modules` object property which contains the list of external modules to
 *            register within class.
 * @returns Returns the instance to the class.
 */
function ConfiguredClass(config) {
    this.modules = config.modules || {};

    this.noop = function() {
    };
}

ConfiguredClass.prototype.UNDEF = "undefined";

// execute a given function within a helper external module
ConfiguredClass.prototype.execModuleFn = function(name, fn, args, thisArg) {
    if (this.modules[name] && this.modules[name].instance && this.modules[name].exports
            && this.modules[name].exports.indexOf(fn) >= 0) {

        if (args && 'Array' !== args.constructor.name) {
            args = [ args ];
        }

        var result = this.modules[name].instance[fn].apply(thisArg || {}, args);

        return result;
    }

    return null;
};

ConfiguredClass.prototype.init = function() {
};