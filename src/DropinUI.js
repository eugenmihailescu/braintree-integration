"use strict";
/**
 * Wrapper class that integrates Drop-in UI (Braintree.js SDK v2) on a checkout page
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param {Object}
 *            config - Default class configuration
 * @see {@link https://developers.braintreepayments.com/guides/drop-in/android/v2}
 * 
 * @tutorial commonConf
 * @tutorial dropinUI
 * @tutorial threeDSecure
 */
function DropinUI(config) {
    GenericIntegration.call(this, config);

    function onBraintreeError(err) {
        that.onError(that.execModuleFn('utils', 'parseError', err));
    }

    var that = this;

    var container = config.container; // the container for Drop-in iFrame

    /**
     * @since 1.0
     * @inheritdoc
     * @override
     * @default
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
        onPaymentMethodReceived : function(paymentMethodInfo) {
            that.onPaymentMethodReceived.call(that, paymentMethodInfo);
        },
        onReady : this.onReady,
        onError : onBraintreeError
    };

    this.init();
}

DropinUI.prototype = Object.create(GenericIntegration.prototype);
DropinUI.prototype.constructor = DropinUI;

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
DropinUI.prototype.init = function() {
    GenericIntegration.prototype.init.call(this);

    braintree.setup(this.client_token, this.integrationType, this.clientOptions);
};
