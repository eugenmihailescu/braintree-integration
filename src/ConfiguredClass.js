"use strict";
/**
 * A prototype of a generic class that accepts a configuration object which can register a various number of external modules
 * that the class may use.
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param {object}
 *            config - An object that is expected to contain a `modules` object property which contains the list of external
 *            modules to register within class.
 */
function ConfiguredClass(config) {
    /**
     * The external modules that this instance may uses as specified by constructor argument
     * 
     * @since 1.0
     * @member {Object=}
     * @default {}
     */
    this.modules = config.modules || {};

    /**
     * An dummy no-operation callback function
     * 
     * @since 1.0
     * @abstract
     * @member {function}
     */
    this.noop = function() {
    };
}

/**
 * The "undefined" constant to be used while checking if the type of an object is undefined.
 * 
 * @constant
 * @default
 * @since 1.0
 * @type {string}
 * @example if (myInstance.UNDEF !== typeof myVar) {...}
 */
ConfiguredClass.prototype.UNDEF = "undefined";

/**
 * Execute a given function within a helper external module
 * 
 * @param {string}
 *            name - The module name which defines the called function
 * @param {string}
 *            fn - The called function name within the module given by name
 * @param {(string|string[])=}
 *            args - The function argument or an array of arguments that are passed to the called function
 * @param {object=}
 *            thisArg - The context in which the function is executed
 * @example myInstance.execModuleFn('utils', 'parseError', err)
 * @since 1.0
 */
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

/**
 * Class initialization prototype. Normally the children classes call the init method as the last statement of the class
 * constructor.
 * 
 * @abstract
 * @since 1.0
 */
ConfiguredClass.prototype.init = function() {
};