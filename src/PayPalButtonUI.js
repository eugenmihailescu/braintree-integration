"use strict";

/**
 * Wrapper class that integrates the PayPal checkout flow (Braintree.js SDK v3) on a checkout page
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param {Object}
 *            config - Default class configuration
 * @see {@link https://braintree.github.io/braintree-web/3.6.3/PayPal.html|PayPal} Braintree component
 * @see {@link https://github.com/eugenmihailescu/paypal-button-wrapper|PayPalButton} class
 * 
 * @tutorial commonConf
 * @tutorial paypalButtonUI
 */
function PayPalButtonUI(config) {
    // NOTE: Error: Permission denied to access property "href (adblocking-software??)

    BraintreeUI3.call(this, config);

    var that = this;

    /**
     * The checkout PayPal button's jQuery container selector
     * 
     * @since 1.0
     * @member {string}
     * @default false
     */
    var container = config.container || false;

    /**
     * Creates the PayPal button insider container
     * 
     * @since 1.0
     * @private
     */
    function createButton() {
        var ct = container || "body";
        var btn;
        var data = $.extend(this.buttonOptions, {
            "type" : this.offerCredit ? "credit" : "checkout",
        });

        if (data.color.length) {
            btn = PayPalButton.prototype.createCheckoutButton(ct, data.id, data.size, data.shape, data.color, data.label,
                    data.show_icon, data.tagline, data.locale, data.disabled, data.type);
        } else {
            if (data.style.length) {
                btn = PayPalButton.prototype.createStyleButton(ct, data.id, data.size, data.shape, data.style, data.label,
                        data.show_icon, data.locale, data.disabled);
            }
        }
    }

    /**
     * Creates the PayPal payment method selector inside container
     * 
     * @since 1.0
     * @private
     */
    function createPaymentMethodContainer() {
        var ct = container || "body";

        var id = this.getButtonId().replace(".", "").replace("#", "") + "-payment-method";

        var attr = {
            id : id,
            "class" : id
        };

        $("<div/>", attr).appendTo($(ct)).css({
            "min-height" : "26px",
            "display" : "none"
        });

        var parentDiv = $("#" + id);
        var logo_url = this.offerCredit ? this.PAYPALCREDIT_LOGO : this.PAYPAL_LOGO;
        // add the Logo leftwards
        $("<div/>", {
            "class" : id + "-logo"
        }).appendTo(parentDiv).css({
            "display" : "inline-block",
            "float" : "left",
            "width" : "40px",
            "height" : "26px",
            "background-image" : "url('" + logo_url + "')"
        });

        // add the payment method detail wrapper full-width
        $("<div/>", {
            "class" : id + "-detail"
        }).appendTo(parentDiv).css({
            "display" : "inline-block",
            "width" : "auto",
            "margin-left" : "10px",
            "margin-right" : "10px",
            "float" : "left"
        });

        // the payment method detail span (here goes the email)
        $("<span/>", {
            "class" : "paypal-payment-method-email"
        }).appendTo($("." + id + "-detail")).css({
            "font-size" : "0.75em",
            "color" : "#0076BF"
        });

        // add a Cancel button to its wrapper
        $("<a/>", {
            "class" : id + "-cancel-button",
            "href" : "#"
        }).appendTo("." + id + "-detail").css({
            "margin" : "10px"
        }).on("click", function() {
            that.hidePaymentMethod();
        }).text("Cancel");
    }

    /**
     * The Braintree Vault dataCollector instance. Vault flow must collect&submit device data.
     * 
     * @since 1.0
     * @member {Object}
     * @see {@link https://braintree.github.io/braintree-web/3.6.3/DataCollector.html}
     */
    this.dataCollectorInstance = null;

    /**
     * @inheritdoc
     * @override
     * @default paypal
     */
    this.integrationType = "paypal";

    /**
     * The PayPal checkout flow. Either "vault" or "checkout"
     * 
     * @since 1.0
     * @member {string=}
     * @default checkout
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.flow = config.flow || "checkout";

    /**
     * Checkout flow only. Either "authorize" (submit but not settle) or "sale" (submit for settlement)
     * 
     * @since 1.0
     * @member {string}
     * @default sale
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.intent = config.intent || "sale";

    /**
     * Checkout flow only. Either "commit" (changes the button to "Pay Now") or FALSE (button to "Continue")
     * 
     * @since 1.0
     * @member {string=}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.useraction = config.useraction || false;

    /**
     * The merchant display name shown on the PayPal checkout flow
     * 
     * @since 1.0
     * @member {string=}
     * @default the Braintree account PayPal displayName
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.displayName = config.displayName || this.execModuleFn("utils", "getAccountSettings", "paypal.displayName");

    /**
     * Change the language, links, and terminology used in the PayPal flow
     * 
     * @since 1.0
     * @member {string=}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.locale = config.locale || false;

    /**
     * Returns a shipping address object in
     * {@link https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize|tokenize}
     * 
     * @since 1.0
     * @member {boolean}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.enableShippingAddress = this.execModuleFn("utils", "toBoolean", config.enableShippingAddress) || false;

    /**
     * Set to false to disable user editing of the shipping address.
     * 
     * @since 1.0
     * @member {boolean}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.shippingAddressEditable = this.execModuleFn("utils", "toBoolean", config.shippingAddressEditable) || false;

    /**
     * Allows you to pass a shipping address you have already collected into the PayPal payment flow.
     * 
     * @since 1.0
     * @member {Object=}
     * @default {}
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.shippingAddressOverride = config.shippingAddressOverride || {};

    /**
     * Preapproved payment agreement description during the Vault flow
     * 
     * @since 1.0
     * @member {string=}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     */
    this.billingAgreementDescription = config.billingAgreementDescription || false;

    /**
     * Offers the customer PayPal Credit if they qualify. Checkout flows only.
     * 
     * @since 1.0
     * @member {boolean=}
     * @default false
     * @see https://braintree.github.io/braintree-web/3.6.3/PayPal.html#tokenize
     * @see https://developers.braintreepayments.com/guides/paypal/paypal-credit/javascript/v3
     */
    this.offerCredit = this.execModuleFn("utils", "toBoolean", config.offerCredit) || false;

    /**
     * The PayPal button options. When button_type=none then `id` should point to an existent element
     * 
     * @since 1.0
     * @member {Object=}
     * @property {string} color - The button color (blue|gold|silver)
     * @property {string} size - The button size (tiny|small|medium|large)
     * @property {string} shape - The button shape (pill|rect)
     * @property {string} label - The button caption, eventually using the {wordmark} tag
     * @property {boolean} show_icon - When true show PayPal logo on button
     * @proprety {boolean} tagline - When true show the PayPal tag line on button
     * @property {string} locale - The locale to use for the PayPal tag line
     * @default {color:"gold",size:"medium",shape:"pill",label:"",show_icon:true,tagline:true,locale:"en_US"}
     */
    this.buttonOptions = config.buttonOptions || {
        color : "gold",// blue|gold|silver
        size : "medium",// tiny|small|medium|large
        shape : "pill",// pill|rect
        label : "",// a button caption eventually using the {wordmark} tag
        show_icon : true,// true|false
        tagline : true,// true|false
        locale : "en_US"
    };

    if (config.onGetAmount) {
        /**
         * The amount of the transaction (required when flow="checkout") provided either as a callback function via the
         * constructor's {@link PayPalButtonUI|configuration} or fetched automatically from
         * {@link GenericIntegration#inputs|inputs.amount} member
         * 
         * @since 1.0
         * @member {callback=}
         * @default {@link ConfiguredClass#noop}
         */
        this.onGetAmount = config.onGetAmount;
    } else if (config.inputs.amount) {
        // fallback to the currency input, if any
        this.onGetAmount = $(config.inputs.amount).val;
    } else {
        // do nothing otherwise
        this.onGetAmount = this.noop;
    }

    // The currency code of the amount, required when flow="checkout"
    if (config.onGetCurrency) {
        /**
         * The currency code of the amount (required when flow="checkout") provided either as a callback function via the
         * constructor's {@link PayPalButtonUI|configuration} or fetched automatically from
         * {@link GenericIntegration#inputs|inputs.currency} member
         * 
         * @since 1.0
         * @member {callback=}
         * @default {@link ConfiguredClass#noop}
         */
        this.onGetCurrency = config.onGetCurrency;
    } else if (config.inputs.currency) {
        // fallback to the currency input, if any
        this.onGetCurrency = $(config.inputs.currency).val;
    } else {
        // do nothing otherwise
        this.onGetCurrency = this.noop;
    }

    /**
     * Callback as provided via constructor's {@link PayPalButtonUI|configuration} that is called when on PayPal tokenization
     * success
     * 
     * @since 1.0
     * @member {callback=}
     * @default {@link ConfiguredClass#noop}
     */
    this.onPaymentMethodReceived = config.onPaymentMethodReceived || that.noop;

    // Disable the superclass submit default action
    if (this.buttonOptions.button_type !== "submit") {
        this.submit = this.noop;
    }

    /**
     * Returns the PayPal button selector
     * 
     * @since 1.0
     * @returns {string} - Returns the button selector
     */
    this.getButtonId = function() {
        return that.buttonOptions.id ? "#" + that.buttonOptions.id : container;
    }

    /**
     * Destorys the HTML elements created by this integration
     * 
     * @since 1.0
     */
    this.teardownHTML = function() {
        var selector = this.getButtonId() || "body";

        if (this.id) {
            var id = '#' + this.id;
            if (selector.indexOf(id) < 0) {
                selector += " #" + this.id;
            }
        }

        // remove the PayPal button
        $(selector).remove();

        // remove the PayPal payment method DIV
        $(this.getButtonId() + "-payment-method").remove();
    };

    /**
     * Display the PayPal payment method container
     * 
     * @since 1.0
     */
    this.showPaymentMethod = function() {
        $("#" + that.buttonOptions.id).hide();

        $(that.getButtonId().replace("#", ".") + "-payment-method").show();
    }

    /**
     * Hide the PayPal payment method
     * 
     * @since 1.0
     */
    this.hidePaymentMethod = function() {
        $(that.getButtonId().replace("#", ".") + "-payment-method").hide();

        $("#" + that.buttonOptions.id).show();
    };

    /**
     * Disable the PayPal payment button
     * 
     * @since 1.0
     */
    this.disablePaymentButton = function() {
        $("#" + that.buttonOptions.id).attr("disabled", true).off("click");
    };

    /**
     * Enable the PayPal payment button
     * 
     * @since 1.0
     */
    this.enablePaymentButton = function() {
        $("#" + that.buttonOptions.id).attr("disabled", false).on("click", that.tokenize);
    };

    /**
     * Tokenize the PayPal information. On success a hidden {@link GenericIntegration#inputs|input} field will be set with the
     * PayPal payment method nonce
     * 
     * @param {Event}
     *            event - The Javascript {@link https://developer.mozilla.org/en/docs/Web/API/Event|Event} that triggered this
     *            function
     */
    this.tokenize = function(event) {
        // disable the default button action
        event.preventDefault();

        // prevent subsequent clicks
        that.disablePaymentButton();

        var amount = that.onGetAmount() || $(that.inputs.amount).val() || 0;
        var currency = that.onGetCurrency() || $(that.inputs.currency).val() || "";
        var args = {
            "flow" : that.flow,

        };

        if (amount) {
            args["amount"] = amount;
        }
        if (currency) {
            args["currency"] = currency;
        }

        if (that.displayName) {
            args["displayName"] = that.displayName;
        }

        if (that.locale) {
            args["locale"] = that.locale;
        }

        if (that.enableShippingAddress) {
            args["enableShippingAddress"] = that.enableShippingAddress;
        }
        if (that.shippingAddressOverride) {
            args["shippingAddressOverride"] = that.shippingAddressOverride;
        }
        if (that.shippingAddressEditable) {
            args["shippingAddressEditable"] = that.shippingAddressEditable;
        }

        if ("checkout" === that.flow) {
            args["intent"] = that.intent;

            if (that.offerCredit) {
                args["offerCredit"] = that.offerCredit;
            }

            if (that.useraction) {
                args["useraction"] = that.useraction;
            }

        } else if ("vault" === that.flow) {
            if (that.billingAgreementDescription) {
                args["billingAgreementDescription"] = that.billingAgreementDescription;
            }
        }

        // https://braintree.github.io/braintree-web/3.6.3/PayPal.html#~tokenizeReturn
        var tokenizeReturn = that.integration_instance.tokenize(args, function(err, paymentMethodInfo) {
            that.enablePaymentButton();

            if (err) {
                that.onError(that.execModuleFn('utils', 'parseError', err));
                return;
            }

            that.onPaymentMethodReceived(paymentMethodInfo);

            var id = that.getButtonId().replace("#", ".") + "-payment-method";
            $(id + "-detail span").text(paymentMethodInfo.details.email);

            that.showPaymentMethod();

            that.onPaymentMethodReceived(paymentMethodInfo);
        });

    };

    // create a HTML element button wrapped by container
    createButton.call(this);
    createPaymentMethodContainer.call(this);
    this.enablePaymentButton();

    this.init();
}

PayPalButtonUI.prototype = Object.create(BraintreeUI3.prototype);
PayPalButtonUI.prototype.constructor = PayPalButtonUI;

/**
 * @inheritdoc
 * @override
 */
PayPalButtonUI.prototype.destroy = function(onDone) {
    var that = this;

    // we don't want to let behind orphan events
    this.disablePaymentButton();

    this.teardownHTML();

    // tear-down the PayPal integration (eventually the data-collector instance)
    GenericIntegration.prototype.destroy.call(this, function() {
        if (that.dataCollectorInstance) {
            that.dataCollectorInstance.teardown(function(err) {
                if (err) {
                    console.error("Could not tear down the data-collector instance!");
                } else {
                    that.dataCollectorInstance = null;
                }

                onDone();
            });
        } else {
            onDone();
        }
    });
};

/**
 * @inheritdoc
 * @override
 */
PayPalButtonUI.prototype.postInit = function() {
    var that = this;
    // the BT client is successfully created, create the PayPal components

    // create the Vault data-collector instance
    if ("vault" === this.flow) {
        braintree.dataCollector.create({
            client : this.client,
            paypal : true
        }, function(err, dataCollectorInstance) {
            if (err) {
                that.onError(that.execModuleFn('utils', 'parseError', err));
                return;
            }

            that.dataCollectorInstance = dataCollectorInstance;

            that.setFieldValue(that.inputs.deviceData, dataCollectorInstance.deviceData);
        });
    }

    // create the PayPal integration
    braintree.paypal.create({
        client : this.client
    }, function(err, paypalInstance) {
        if (err) {
            that.onError(that.execModuleFn('utils', 'parseError', err));
            return;
        }

        var btn_id = that.getButtonId();
        var monitor = setInterval(function() {
            var elem = $(btn_id);
            if (elem.length) {
                that.enablePaymentButton();
                clearInterval(monitor);
            }
        }, 100);

        that.onReady(paypalInstance);

        $("body").on("cancel_paypal_payment", function() {
            that.hidePaymentMethod();
        });

    });

};

/**
 * @inheritdoc
 * @override
 */
PayPalButtonUI.prototype.init = function() {
    // the BT client is not yet created, the button may not be used
    this.disablePaymentButton();

    BraintreeUI3.prototype.init.call(this);
};

/**
 * The PayPal button small logo URL
 * 
 * @constant
 * @default
 */
PayPalButtonUI.prototype.PAYPAL_LOGO = "https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png";

/**
 * The PayPal Credit button small logo URL
 * 
 * @constant
 * @default
 */
PayPalButtonUI.prototype.PAYPALCREDIT_LOGO = "https://www.paypalobjects.com/webstatic/en_US/i/buttons/ppc-acceptance-small.png";
