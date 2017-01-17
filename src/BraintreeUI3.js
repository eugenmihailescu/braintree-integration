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

    this.client = null; // the Braintree v3 client instance

}

BraintreeUI3.prototype = Object.create(GenericIntegration.prototype);
BraintreeUI3.prototype.constructor = BraintreeUI3;

// the class default initialization
BraintreeUI3.prototype.init = function() {
    GenericIntegration.prototype.init.call(this);

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
};

BraintreeUI3.prototype.postInit = function() {
}

// the class default destructor
BraintreeUI3.prototype.destroy = function(onDone) {
    $(this.form).off('submit');

    GenericIntegration.prototype.destroy.call(this, onDone);
}