/*global
    ajaxurl, client_sdk, BraintreeUtils, Demo, DropinUI, CustomUI, HostedFieldsUI, HostedFieldsUI, ThreeDSecure, $
 */

function BraintreeApp() {
    "use strict";
    // /////////////////////////////
    // PRIVATE MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    var that = this;

    // setup a session 3DS client
    function init3DS() {
        var result = null;

        if (that.FALSE !== that.threeDS_option && that.bt_utils.is3DSEnabled()) {
            result = new ThreeDSecure(that.getIntegrationConf("3ds").threeds);
        }

        that.ui_obj.card.set3DSecure(result);
        if (!result) {
            that.ui_obj.card.allow3DSPaymentsOny = false;
        }
        $("#threeDS_option").prop(that.DISABLED, !(result || that.FALSE === that.threeDS_option));
        $("#avs_option").prop(that.DISABLED,
                !(that.TRUE === that.threeDS_option && result && that.bt_utils.getAVSChallenges().length));

        return result;
    }

    // setup the chosen integration
    function setIntegration(ui_type) {
        var url = "";

        switch (ui_type) {
        case that.PAYPALBUTTON:
            that.ui_obj.paypal = new PayPalButtonUI(that.getIntegrationConf(ui_type).paypal);
            url = "paypal/overview/javascript/v3";
            break;
        case that.DROPINUI:
            // setup a Dropin-UI integration
            that.ui_obj.card = new DropinUI(that.getIntegrationConf(ui_type).card);
            url = "drop-in/javascript/v2";
            $("#new_payment_method").click();
            $(".customer-payment-methods").addClass(that.HIDDEN);
            break;
        case that.CUSTOMUI:
            that.ui_obj.card = new CustomUI(that.getIntegrationConf(ui_type).card);
            url = "credit-cards/overview";
            break;
        case that.HOSTEDUI:
            that.ui_obj.card = new HostedFieldsUI(that.getIntegrationConf(ui_type).card);
            url = "hosted-fields/overview/javascript/v3";
            break;
        case that.HOSTEDUI_PAYPAL:
            var conf = that.getIntegrationConf(ui_type);
            that.ui_obj.paypal = new PayPalButtonUI(conf.paypal);
            that.ui_obj.card = new HostedFieldsUI(conf.card);
            url = "hosted-fields/overview/javascript/v3";
            break;
        }

        if ([ that.DROPINUI, that.PAYPALBUTTON ].indexOf(ui_type) >= 0) {
            $(".customer-payment-methods").removeClass(that.HIDDEN);
            $(".card-wrapper input:checked").trigger(that.CHANGE);
        }

        $("a.braintree").attr("href", "https://developers.braintreepayments.com/guides/" + url);

        if (that.PAYPALBUTTON !== ui_type) {
            // setup a 3DS filter
            init3DS();
        }
    }

    // bind events to the page elements
    function bindEvents() {
        var paypal_options = [ "flow", "intent", "useraction", "displayName", "locale", "enableShippingAddress",
                "offerCredit", "shippingAddressEditable", "billingAgreementDescription" ];
        var paypal_button_options = [ "color", "size", "shape", "label", "tagline", "style" ];

        $("#ui_selector").off(that.CHANGE).on(that.CHANGE, function() {
            $(".card-wrapper").show();
            
            var ui_type = $(this).val();

            that.update_theme_list(ui_type);

            that.loadCardTheme(that.theme_id, ui_type, function() {
                $("#customerId").trigger("change");
                setIntegration(ui_type);
            });

            if (ui_type === that.PAYPALBUTTON || ui_type === that.HOSTEDUI_PAYPAL) {
                $('.paypal-options').removeClass(that.HIDDEN);
            } else {
                $('.paypal-options').addClass(that.HIDDEN);
            }
        }).trigger(that.CHANGE);

        $("#threeDS_option").off(that.CHANGE).on(that.CHANGE, function() {
            that.threeDS_option = $(this).val();

            that.ui_obj.card.allow3DSPaymentsOny = that.TRUE === that.threeDS_option;
            init3DS();
        });

        $("#avs_option").off(that.CHANGE).on(that.CHANGE, function() {
            that.avs_option = $(this).val();

            init3DS();
        });

        $("button[type=\"submit\"]").on(that.CLICK, function() {
            $(this).val("Processing...").attr(that.DISABLED, that.DISABLED);
            that.blockUI();
        });

        $("a.extra-option-toggle").off(that.CLICK).on(that.CLICK, function() {
            $(this).parent().toggleClass("on");
            $(".extra-options").slideToggle();
        });

        $("#vault_option").off(that.CHANGE).on(that.CHANGE, function() {
            var vault_option = $(this).val();
            var s = $(".customer-id-option");
            if (!(vault_option.length && s.is(":visible"))) {
                s.slideToggle();
            }
        }).val($("#vault_option").val()).trigger(that.CHANGE);

        $("#customerId").off(that.CHANGE).on(that.CHANGE, function() {
            var method_type = "paypal-button" === $("#ui_selector").val() ? "PayPalAccount" : "CreditCard";

            if (that.DROPINUI !== $("#ui_selector").val()) {
                that.loadVaultPaymentMethods($(this).val(), method_type, function() {
                    $(".payment-method input").off(that.CHANGE).change(function() {
                        var s = $(".card-wrapper");
                        if (!($(this).val().length && s.is(":hidden"))) {
                            s.slideToggle();
                        }
                    });

                    $(".card-wrapper input:checked").trigger(that.CHANGE);
                });
            } else {
                that.loadVaultPaymentMethods(null, method_type);
            }

        }).trigger(that.CHANGE);

        $("#theme_options").off(that.CHANGE).on(that.CHANGE, function() {
            var ui_type = $("#ui_selector").val();

            that.theme_id = $(this).val();

            that.loadCardTheme(that.theme_id, ui_type, function() {
                setIntegration(ui_type);
            });
        });

        paypal_options.forEach(function(item) {
            $("#paypal-" + item).on("change", function() {
                that.paypalOptions[item] = $(this).val();
            });
        });

        paypal_button_options.forEach(function(item) {
            $("#paypal-button-" + item).on("change", function() {
                that.paypalOptions.buttonOptions[item] = $(this).val();
            });
        });

        $("#apply-options").on("click", function() {
            $("#ui_selector").trigger("change");
        });

        $("#paypal-flow").on("change", function() {
            $("#paypal-intent,#paypal-offerCredit,#paypal-useraction").attr("disabled", "checkout" !== $(this).val());

        });

        $("#paypal-offerCredit").on("change", function() {
            $("#paypal-button-color,#paypal-button-style").attr("disabled", "true" === $(this).val());
        });

        $("#paypal-button-style").on("change", function() {
            var has_style = !!$(this).val().length;

            if (has_style) {
                $("#paypal-button-color").val("").trigger("change");
            }

            $("#paypal-button-color").attr("disabled", has_style);
            $("#paypal-button-shape").attr("disabled", has_style);
            $("#paypal-button-tagline").attr("disabled", has_style);
            $("#paypal-button-label-hint")[has_style ? "hide" : "show"]();
        }).trigger("change");

        $("#paypal-button-color").on("change", function() {
            if ($(this).val().length) {
                $("#paypal-button-style").val("").trigger("change");
            }
            $("#paypal-button-style").attr("disabled", !!$(this).val().length);
        }).trigger("change");
    }

    // ///////////////////////////////
    // PRIVILEGED MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    this.name = "BraintreeApp";

    this.queue = 0;

    this.bt_utils = null;
    this.client_token = null;
    this.ui_obj = {
        card : null,
        paypal : null
    };
    this.threeDS_option = $("#threeDS_option").val();
    this.avs_option = $("#avs_option").val();
    this.theme_id = "";
    this.paypalOptions = {
        flow : "checkout",
        intent : "sale",
        useraction : "",
        enableShippingAddress : "false",
        shippingAddressEditable : "false",
        billingAgreementDescription : "",
        offerCredit : "false",
        displayName : "",
        locale : "en_US",
        buttonOptions : {
            color : "",
            size : "medium",
            shape : "pill",
            label : "Pay with {wordmark}",
            tagline : false,
            show_icon : true,
            locale : "en_US",
            disabled : false,
            type : "button",
            style : "primary",
            id : "foo"
        }
    };

    this.tearDown = function() {

        if (that.ui_obj.card) {
            that.ui_obj.card.destroy(function() {
                delete that.ui_obj.card;
                that.ui_obj.card = null;
            });
        }
        if (that.ui_obj.paypal) {
            that.ui_obj.paypal.destroy(function() {
                delete that.ui_obj.paypal;
                that.ui_obj.paypal = null;
            });
        }
    };

    this.init = function(token) {
        this.client_token = token;

        this.bt_utils = new BraintreeUtils(token);

        if (!this.bt_utils.getAVSChallenges("cvv")) {
            $("div.card-cvv-wrapper").css("display", "none");
        }

        if (!this.bt_utils.getAVSChallenges("postal_code")) {
            $("div.card-postal-code-wrapper").css("display", "none");
        }

        bindEvents();
    };

    this.set_token($("#customerId").val());

}

BraintreeApp.prototype.HIDDEN = "hidden";
BraintreeApp.prototype.CHANGE = "change";
BraintreeApp.prototype.CLICK = "click";
BraintreeApp.prototype.CUSTOMUI = "custom-ui";
BraintreeApp.prototype.DROPINUI = "drop-in-ui";
BraintreeApp.prototype.HOSTEDUI = "hosted-ui";
BraintreeApp.prototype.PAYPALBUTTON = "paypal-button";
BraintreeApp.prototype.HOSTEDUI_PAYPAL = "hosted-ui-paypal-button";

BraintreeApp.prototype.DISABLED = "disabled";
BraintreeApp.prototype.FALSE = "false";
BraintreeApp.prototype.TRUE = "true";

BraintreeApp.prototype.checkout = new Demo({
    formID : "payment-form",
    development : true
});

window["BraintreeApp"] = BraintreeApp;