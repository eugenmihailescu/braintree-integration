"use strict";
/**
 * Wrapper class that provides the backbone for a Braintree {@link CustomUI}|{@link HostedFieldsUI}|{@link PayPalButtonUI}
 * integration using a {@link BraintreeClient3} client
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param {Object}
 *            config - Default class configuration
 */
function BraintreeUI3(config) {

    GenericIntegration.call(this, config);

    /**
     * A shared {@link BraintreeClient3|client} instance provided via the constructor's {@link BraintreeUI3|configuration}
     * 
     * @since 1.0
     * @member {Object}
     * @default null
     */
    this.client = config.client || null;

}

BraintreeUI3.prototype = Object.create(GenericIntegration.prototype);
BraintreeUI3.prototype.constructor = BraintreeUI3;

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
BraintreeUI3.prototype.init = function() {
    GenericIntegration.prototype.init.call(this);

    if (null === this.client) {
        var that = this;

        var client = new BraintreeClient3({
            token : this.client_token,
            onError : this.onError,
            onClientReady : function(clientInstance) {
                that.client = clientInstance;
                that.postInit();
            }
        });

        client.init();
    } else {
        // probably using a shared client instance (?!)
        this.postInit();
    }
};

/**
 * A callback that is called immediately after initialization
 * 
 * @abstract
 */
BraintreeUI3.prototype.postInit = function() {
};

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
BraintreeUI3.prototype.destroy = function(onDone) {
    $(this.form).off('submit');

    $("body").off("init_paypal_payment");
    $("body").off("cancel_paypal_payment");

    GenericIntegration.prototype.destroy.call(this, onDone);
};