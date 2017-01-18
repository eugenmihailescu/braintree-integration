"use strict";

/**
 * Abstract class for card payment integration
 * 
 * @param config
 *            Default class configuration
 * 
 * @returns Object Returns an instance of the class
 */
function GenericIntegration(config) {
    // call the superclass constructor
    ConfiguredClass.call(this, config);

    var that = this;

    // ///////////////////////////////
    // PRIVILEGED MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // helper function that appends hidden fields to the integration form
    this.setFieldValue = function(name, value) {
        var field = $("input[name=\"" + name + "\"]");

        if (field.length) {
            field.val(value);
        } else {
            $("<input>", {
                "type" : "hidden",
                "name" : name,
                "value" : value
            }).appendTo(that.form);
        }
    };

    // helper function that submits the checkout form
    this.submit = function(nonce) {
        that.form.off("submit").trigger("submit");
    };

    // the ThreeDSecure helper class instance
    this.threeDSecure = config.threeDSecure || false;

    // the integration instance
    this.integration_instance = null;

    // the class dependent integration type (should be overriden by a prticular integration subclass)
    this.integrationType = config.integrationType || false;

    // the integration form
    this.form = config.form || false;

    // the integration dependent input controls
    this.inputs = config.inputs || {};

    // current session integration client token
    this.client_token = config.token;

    // true if integration accepts 3DS cards only
    this.allow3DSPaymentsOny = config.allow3DSPaymentsOny || false;

    // overrides the `allow3DSPaymentsOny` option: if non-3DS card but merchant has AVS rules then accept the payment
    // (hopefully it will be validated by the gateway)
    this.ignore3DSIfAVS = config.ignore3DSIfAVS || false;

    // callback to notify on errors
    this.onError = config.onError || this.noop;

    // /////////////////////////////
    // PRIVILEGED FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // callback to backup the BT integration handle necessary on instance destroy
    // on error destroy+recreate the integration then notify the error callback
    this.processError = function(message) {
        if (that.integration_instance) {
            that.integration_instance.teardown(function(err) {
                if (err) {
                    // we don't want to print out these errors (?!)
                    console.error("Could not tear down " + that.integrationType + " integration!");
                } else {
                    that.integration_instance = null;
                    that.init();
                }
            });
        }

        if (that.UNDEF !== typeof message) {
            that.onError(message);
        }
    };

    this.onReady = function(integration) {
        that.integration_instance = integration;
    };

    // callback notified on the 3DS authentication failure
    this.on3DSFail = function() {
        that.processError("3DS_FAILED");
    };

    // callback notified when 3DS is bypassed by AVS rules
    this.onBypass3DS = function(response) {
        if (that.ignore3DSIfAVS && that.execModuleFn("utils", "getAVSChallenges").length) {
            that.setFieldValue(that.inputs.non3DSPayment, true);

            return true;
        }

        return false;
    };

    // a valid tokenization (Custom|Hosted) or card data (Drop-in) sends its payment nonce here
    this.onPaymentMethodReceived = function(paymentMethodInfo) {
        // CreditCard [not:PayPalAccount|ApplePayCard|AndroidPayCard]
        if ("CreditCard" === paymentMethodInfo.type) {
            if (that.threeDSecure && that.execModuleFn("utils", "is3DSEnabled")) {
                that.threeDSecure.verifyCard({
                    paymentMethodInfo : paymentMethodInfo,
                    onSuccess : submit,
                    onError : that.on3DSFail,
                    onBypass3DS : that.onBypass3DS,
                });
                return;
            }
            if (that.allow3DSPaymentsOny) {
                return that.on3DSFail();
            }
        }

        that.setFieldValue(that.inputs.paymentNonce, paymentMethodInfo.nonce);

        that.submit();
    };

    // setter for ThreeDSecure instance
    this.set3DSecure = function(instance) {
        that.threeDSecure = instance;
    };

}

GenericIntegration.prototype = Object.create(ConfiguredClass.prototype);
GenericIntegration.prototype.constructor = GenericIntegration;

// on destroy tear-down the integration (clean-up DOM, events, etc)
GenericIntegration.prototype.destroy = function(onDone) {
    var that = this;

    onDone = onDone || this.noop;

    if (this.integration_instance) {
        this.integration_instance.teardown(function(err) {
            if (err) {
                console.error("Could not tear down " + that.integrationType + " integration!");
            } else {
                that.integration_instance = null;
            }
            onDone();
        });
    } else {
        onDone();
    }
};