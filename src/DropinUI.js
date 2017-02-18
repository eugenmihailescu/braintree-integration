"use strict";
/**
 * Class for Drop-in UI integration (Braintree.js SDK v2)
 * 
 * @class
 * @since 1.0
 * @author Eugen Mihailescu
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @param {Object}
 *            config - Default class configuration
 * @see {@link https://developers.braintreepayments.com/guides/drop-in/android/v2}
 */
function DropinUI(config) {
    GenericIntegration.call(this, config);

    function onBraintreeError(err) {
        that.onError(that.execModuleFn('utils', 'parseError', err));
    }

    var that = this;

    var container = config.container; // the container for Drop-in iFrame

    /**
     * @inheritdoc
     * @override
     * @default dropin
     */
    this.integrationType = 'dropin'; // this class Braintree integration type

    /**
     * Braintree Client setup options
     * 
     * @member {Object}
     * @protected
     */
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

/**
 * @inheritdoc
 * @override
 */
DropinUI.prototype.init = function() {
    GenericIntegration.prototype.init.call(this);

    braintree.setup(this.client_token, this.integrationType, this.clientOptions);
};
