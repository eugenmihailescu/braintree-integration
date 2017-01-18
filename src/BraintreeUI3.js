"use strict";
/**
 * Generic class for a Braintree v3 UI integration (CustomUI|HostedFields)
 * 
 * @param config
 *            The class default configuration
 * @returns
 */
function BraintreeUI3(config) {

    GenericIntegration.call(this, config);

    // we could possibly use a shared client instead of creating a new instance
    this.client = config.client || null;

}

BraintreeUI3.prototype = Object.create(GenericIntegration.prototype);
BraintreeUI3.prototype.constructor = BraintreeUI3;

// the class default initialization
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

BraintreeUI3.prototype.postInit = function() {
}

// the class default destructor
BraintreeUI3.prototype.destroy = function(onDone) {
    $(this.form).off('submit');

    GenericIntegration.prototype.destroy.call(this, onDone);
}