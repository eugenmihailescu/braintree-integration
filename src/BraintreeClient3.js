"use strict";
/**
 * A prototype of a generic Client UI that uses the
 * {@link https://braintree.github.io/braintree-web/3.8.0/Client.html|Braintree Client SDK v3}
 * 
 * @since 1.0
 * @class
 * @author Eugen Mihailescu
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @param {Object}
 *            config - The client default configuration
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
 * @inheritdoc
 * @override
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
};