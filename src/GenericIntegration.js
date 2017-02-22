"use strict";

/**
 * Abstract class that provides the backbone for a Braintree card payment integration
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @extends ConfiguredClass
 * @since 1.0
 * @param {Object}
 *            config - Default class configuration
 */
function GenericIntegration(config) {
    // call the superclass constructor
    ConfiguredClass.call(this, config);

    var that = this;

    // ///////////////////////////////
    // PRIVILEGED MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    /**
     * Appends a hidden fields to the integration form
     * 
     * @since 1.0
     * @param {string}
     *            name - The hidden field name to append
     * @param {string|number}
     *            value - The hidden field value
     * @example myInstance.setFieldValue("payment_method_nonce", "gt49b3k3c7");
     */
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

    /**
     * Submits the checkout form
     * 
     * @since 1.0
     * @param {string=}
     *            nonce - An optional payment method nonce that will be submitted to the backend server
     */
    this.submit = function(nonce) {
        if (that.UNDEF !== typeof nonce) {
            that.setFieldValue(that.inputs.paymentNonce, nonce);
        }

        $(that.form).off("submit").trigger("submit");
    };

    /**
     * The ThreeDSecure instance when provided via the constructor's {@link GenericIntegration|configuration}
     * 
     * @since 1.0
     * @member {(Object|boolean)=}
     * @default false
     */
    this.threeDSecure = config.threeDSecure || false;

    /**
     * The Braintree integration instance after a successful initialization
     * 
     * @since 1.0
     * @member {Object=}
     * @default null
     */
    this.integration_instance = null;

    /**
     * The class dependent integration type (should be overriden by a prticular integration subclass)
     * 
     * @since 1.0
     * @member {string=}
     * @default false
     */
    this.integrationType = config.integrationType || false;

    /**
     * The integration (jQuery) selector of the checkout form when provided via the constructor's
     * {@link GenericIntegration|configuration}
     * 
     * @since 1.0
     * @member {string=}
     * @default false
     */
    this.form = config.form || false;

    /**
     * The integration dependent input controls jQuery selectors when provided via the constructor's
     * {@link GenericIntegration|configuration}
     * 
     * @since 1.0
     * @member {Object=}
     * @default {}
     * @property {string=} non3DSPayment - The jQuery selector for the hidden input that is going to be set on non 3DS
     *           payments
     * @property {string=} paymentNonce - The jQuery selector for the hidden input that is going to be set with the payment
     *           method nonce to send to the server backend
     * @property {string=} paymentToken - The jQuery selector for the hidden input that represents the Braintree Vault payment
     *           token
     * @property {string=} card_number - The jQuery selector for the card number input element
     * @property {string=} expiry_date - The jQuery selector for the card expiry date input element
     * @property {string=} cvv_number - The jQuery selector for the card CVV number input element
     * @property {string=} postal_code - The jQuery selector for the card postal code input element (used by AVS rules)
     * @property {string=} street_address - The jQuery selector for the card street address input element (used by AVS rules)
     * @property {string=} amount - The jQuery selector for the amount input element (used by {@link PayPalButtonUI} button)
     * @property {string=} currency - The jQuery selector for the currency input element (used by {@link PayPalButtonUI}
     *           button)
     * @property {string=} deviceData - The jQuery selector for the hidden Braintree Vault data-collector element (used by
     *           {@link PayPalButtonUI} button)
     * @see {@link GenericIntegration#onBypass3DS|onBypass3DS}
     */
    this.inputs = config.inputs || {};

    /**
     * The current integration client token as provided via the constructor's {@link GenericIntegration|configuration}
     * 
     * @member {string}
     */
    this.client_token = config.token;

    /**
     * Whether the current integration should allow 3DS cards only. Provided via the constructor's
     * {@link GenericIntegration|configuration}
     * 
     * @since 1.0
     * @member {boolean=}
     * @default false
     */
    this.allow3DSPaymentsOny = config.allow3DSPaymentsOny || false;

    /**
     * Overrides the {@link GenericIntegration#allow3DSPaymentsOny|allow3DSPaymentsOny} property as following: when TRUE and
     * when a non-3DS card but merchant has AVS rules then accept the payment
     * 
     * @since 1.0
     * @member {boolean}
     * @default false
     */
    // (hopefully it will be validated by the gateway)
    this.ignore3DSIfAVS = config.ignore3DSIfAVS || false;

    /**
     * A callback to notify on error as provided via the constructor's {@link GenericIntegration|configuration}
     * 
     * @since 1.0
     * @member {callback=}
     * @default {@link ConfiguredClass#noop|noop}
     */
    this.onError = config.onError || this.noop;

    // /////////////////////////////
    // PRIVILEGED FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    /**
     * When an error is detected it destroys & reinitializes the Braintree integration then notify the error callback.
     * 
     * @since 1.0
     * @param {(string|Object)=}
     *            message - The error message
     * @see {@link BraintreeUtils|parseError}
     * @see {@link GenericIntegration#onError|onError}
     */
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

    /**
     * A callback called when the integration is created successfully.
     * 
     * @since 1.0
     * @param {Object}
     *            integration - The instance of the created integration object ({@link CustomUI}, {@link DropinUI},
     *            {@link HostedFieldsUI}, {@link PayPalButtonUI})
     */
    this.onReady = function(integration) {
        that.integration_instance = integration;
    };

    /**
     * Callback notified automatically when the 3DS authentication failure
     * 
     * @since 1.0
     * @see {@link GenericIntegration#onPaymentMethodReceived|onPaymentMethodReceived}
     */
    this.on3DSFail = function() {
        that.processError("3DS_FAILED");
    };

    /**
     * Callback notified when 3DS is bypassed by AVS rules
     * 
     * @since 1.0
     * @param {Object}
     *            response - The Braintree
     *            {@link https://braintree.github.io/braintree-web/3.8.0/ThreeDSecure.html#~verifyPayload|verifyPaylod} object
     *            sent by the {@link ThreeDSecure#verifyCard}
     * @see {@link GenericIntegration#onPaymentMethodReceived|onPaymentMethodReceived}
     */
    this.onBypass3DS = function(response) {
        if (that.ignore3DSIfAVS && that.execModuleFn("utils", "getAVSChallenges").length) {
            that.setFieldValue(that.inputs.non3DSPayment, true);

            return true;
        }

        return false;
    };

    /**
     * Set the ThreeDSecure instance to use for 3DS-authentication
     * 
     * @since 1.0
     * @param {Object}
     *            instance - A {@link ThreeDSecure} instance to be used if 3DS authentication is required
     */
    this.set3DSecure = function(instance) {
        that.threeDSecure = instance;
    };

}

GenericIntegration.prototype = Object.create(ConfiguredClass.prototype);
GenericIntegration.prototype.constructor = GenericIntegration;

/**
 * Tear-down the integration (clean-up DOM, events, etc)
 * 
 * @since 1.0
 * @param {callback=}
 *            onDone - A callback function to be called on destroy done.
 */
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

/**
 * A callback called after a valid tokenization that sends the payment method nonce
 * 
 * @since 1.0
 * @param {Object}
 *            paymentMethodInfo - An object that encapsulates the properties (nonce, type) and eventually other callback
 *            properties
 * @see {@link CustomUI#tokenizeCard}
 * @see {@link HostedFieldsUI#tokenizeCard}
 * @see {@link PayPalButtonUI#tokenize}
 * @see {@link DropinUI#clientOptions}
 */
GenericIntegration.prototype.onPaymentMethodReceived = function(paymentMethodInfo) {
    // CreditCard [not:PayPalAccount|ApplePayCard|AndroidPayCard]
    if ("CreditCard" === paymentMethodInfo.type) {
        if (this.threeDSecure && this.threeDSecure.is_available() && this.execModuleFn("utils", "is3DSEnabled")) {

            this.threeDSecure.verifyCard({
                paymentMethodInfo : paymentMethodInfo,
                onSuccess : this.submit,
                onError : this.on3DSFail,
                onBypass3DS : this.onBypass3DS,
            });
            return;
        }
        if (this.allow3DSPaymentsOny) {
            return this.on3DSFail();
        }
    }

    this.setFieldValue(this.inputs.paymentNonce, paymentMethodInfo.nonce);

    if ("PayPalAccount" === paymentMethodInfo.type) {
        return;
    }

    this.submit();
};