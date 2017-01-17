"use strict";
/**
 * Generic class for creating a Braintree.js v3 Client
 * 
 * @param config
 *            The client default configuration
 * @returns Object Returns an instance of the class
 */
function BraintreeClient3(config) {

    // the superclass constructor
    ConfiguredClass.call(this, config);

    // /////////////////////////////
    // PRIVILEGED MEMBERS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    this.clientInstance = null; // a Braintree client instance

    this.client_token = config.token || false; // a Braintree client connection token

    this.onError = config.onError || this.noop; // callback to display the errors

    this.onClientReady = config.onClientReady || this.noop; // callback to `do stuff` on success

}

BraintreeClient3.prototype = Object.create(ConfiguredClass.prototype);
BraintreeClient3.prototype.constructor = BraintreeClient3;

/**
 * Client initialization public method
 */
BraintreeClient3.prototype.init = function() {
    ConfiguredClass.prototype.init.call(this);

    var that = this;

    braintree.client.create({
        authorization : this.client_token
    }, function(clientErr, clientInstance) {
        if (clientErr) {
            that.onError(that.execModuleFn('utils', 'parseError', clientErr));
            return;
        }

        that.clientInstance = clientInstance;

        that.onClientReady(clientInstance);
    });
}