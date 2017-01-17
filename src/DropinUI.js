"use strict";
/**
 * Class for Drop-in UI integration (Braintree.js SDK v2)
 * 
 * @param config
 *            The class default configuration
 * @returns
 */
function DropinUI(config) {
    GenericIntegration.call(this, config);

    function onBraintreeError(err) {
        that.onError(that.execModuleFn('utils', 'parseError', err));
    }

    var that = this;

    var container = config.container; // the container for Drop-in iFrame

    this.integrationType = 'dropin'; // this class Braintree integration type

    this.clientOptions = {
        container : container,
        onPaymentMethodReceived : this.onPaymentMethodReceived,
        onReady : this.onReady,
        onError : onBraintreeError
    };

    this.init();
}

DropinUI.prototype = Object.create(GenericIntegration.prototype);
DropinUI.prototype.constructor = DropinUI;

DropinUI.prototype.init = function() {
    GenericIntegration.prototype.init.call(this);

    braintree.setup(this.client_token, this.integrationType, this.clientOptions);
};

