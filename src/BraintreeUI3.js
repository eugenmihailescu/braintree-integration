"use strict";
/**
 * Generic class for a Braintree v3 UI integration ({@link CustomUI}|{@link HostedFieldsUI}|{@link PayPalButtonUI})
 * 
 * @class
 * @since 1.0
 * @author Eugen Mihailescu
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
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
 * @inheritdoc
 * @override
 */
BraintreeUI3.prototype.destroy = function(onDone) {
    $(this.form).off('submit');

    GenericIntegration.prototype.destroy.call(this, onDone);
};