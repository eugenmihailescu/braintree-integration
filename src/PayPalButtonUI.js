"use strict";

function PayPalButtonUI(config) {
    // NOTE: Error: Permission denied to access property "href (adblocking-software??)

    BraintreeUI3.call(this, config);

    var that = this;

    // creates the PayPal button insider container
    function createButton() {
        var container = this.container || "body";

        var data = $.extend(this.buttonOptions, {
            "button" : this.offerCredit ? "credit" : "checkout",
        });

        var attr = {
            "src" : "https://www.paypalobjects.com/api/button.js?",
            "async" : true
        };
        $.each(data, function(key, value) {
            attr["data-" + key] = value;
        });

        $("<script/>", attr).appendTo($(container));
    }

    // creates the PayPal payment method selector inside container
    function createPaymentMethodContainer() {
        var container = this.container || "body";

        var id = this.getButtonId().replace("#", "") + "-payment-method";

        var attr = {
            id : id,
            "class" : id
        };

        $("<div/>", attr).appendTo($(container)).css({
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
            "position" : "absolute",
            "margin-left" : "10px",
            "margin-right" : "10px"
        });

        // the payment method detail span (here goes the email)
        $("<span/>").appendTo($("." + id + "-detail")).css({
            "font-size" : "0.75em"
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

    // Vault flow must collect+submit device data
    this.dataCollectorInstance = null;

    // this class Braintree integration type
    this.integrationType = "paypal";

    // the checkout form PayPal button container
    this.container = config.container || false;

    this.flow = config.flow || "checkout"; // vault|checkout

    // Checkout flows only.
    this.intent = config.intent || "sale";// authorize=submit but not settle;sale=submit for settlement

    // https://braintree.github.io/braintree-web/3.6.3/PayPal.html
    this.useraction = config.useraction || false;// "commit"|false

    // the merchant display name, default to Braintree default
    this.displayName = config.displayName || this.execModuleFn("utils", "getAccountSettings", "paypal.displayName");

    // change the language, links, and terminology used in the PayPal flow
    this.locale = config.locale || false;// see https://braintree.github.io/braintree-web/3.6.3/PayPal.html

    // Returns a shipping address object in tokenize
    this.enableShippingAddress = this.execModuleFn("utils", "toBoolean", config.enableShippingAddress) || false;// true|false

    // Set to false to disable user editing of the shipping address.
    this.shippingAddressEditable = this.execModuleFn("utils", "toBoolean", config.shippingAddressEditable) || false;// true|false

    // line1,line2,city,state,postalCode,countryCode,phone,recipientName
    this.shippingAddressOverride = config.shippingAddressOverride || {};

    // preapproved payment agreement description during the Vault flow
    this.billingAgreementDescription = config.billingAgreementDescription || false;

    // Offers the customer PayPal Credit if they qualify. Checkout flows only.
    this.offerCredit = this.execModuleFn("utils", "toBoolean", config.offerCredit) || false;// https://developers.braintreepayments.com/guides/paypal/paypal-credit/javascript/v3

    // when button_type=none then `id` should point to an existent element
    this.buttonOptions = config.buttonOptions || {
        color : "gold",// blue|gold|silver
        size : "medium",// tiny|small|medium
        shape : "pill",// pill|rect
        button_type : "button"// submit|button|none
    };

    // The amount of the transaction, required when flow="checkout"
    if (config.onGetAmount) {
        // relay on the provided callback
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
        // relay on the provided callback
        this.onGetCurrency = config.onGetCurrency;
    } else if (config.inputs.currency) {
        // fallback to the currency input, if any
        this.onGetCurrency = $(config.inputs.currency).val;
    } else {
        // do nothing otherwise
        this.onGetCurrency = this.noop;
    }

    // disable the superclass submit default action
    if (this.buttonOptions.button_type !== "submit") {
        this.submit = this.noop;
    }

    this.getButtonId = function() {
        return that.buttonOptions.id ? "#" + that.buttonOptions.id : that.container;
    }

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

    this.showPaymentMethod = function() {
        $("#" + that.buttonOptions.id).hide();

        $(that.getButtonId().replace("#", ".") + "-payment-method").show();
    };

    this.hidePaymentMethod = function() {
        $(that.getButtonId().replace("#", ".") + "-payment-method").hide();

        $("#" + that.buttonOptions.id).show();
    };

    this.disablePaymentButton = function() {
        $("#" + that.buttonOptions.id).attr("disabled", true).off("click");
    };

    this.enablePaymentButton = function() {
        $("#" + that.buttonOptions.id).attr("disabled", false).on("click", that.tokenize);
    };

    // validate the card and get a payment nonce
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
        });

    };

    // create a HTML element button wrapped by container
    if (this.buttonOptions.button_type !== "none") {
        createButton.call(this);
        createPaymentMethodContainer.call(this);
    }

    this.init();
}

PayPalButtonUI.prototype = Object.create(BraintreeUI3.prototype);
PayPalButtonUI.prototype.constructor = PayPalButtonUI;

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
}

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

    });

};

PayPalButtonUI.prototype.init = function() {
    // the BT client is not yet created, the button may not be used
    this.disablePaymentButton();

    BraintreeUI3.prototype.init.call(this);
};

PayPalButtonUI.prototype.PAYPAL_LOGO = "https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png";
PayPalButtonUI.prototype.PAYPALCREDIT_LOGO = "https://www.paypalobjects.com/webstatic/en_US/i/buttons/ppc-acceptance-small.png";
