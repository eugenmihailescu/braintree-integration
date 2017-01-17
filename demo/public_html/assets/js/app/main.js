/*global
    ajaxurl, BraintreeUtils, Demo, DropinUI, CustomUI, HostedFieldsUI, HostedFieldsUI, ThreeDSecure, $
 */

function BraintreeApp() {
    "use strict";
    // /////////////////////////////
    // PRIVATE MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    var that = this;

    function init3DS() {
        var result = null;

        if (that.FALSE !== that.threeDS_option && that.bt_utils.is3DSEnabled()) {
            result = new ThreeDSecure(that.getIntegrationConf("3ds"));
        }

        that.ui_obj.set3DSecure(result);
        if (!result) {
            that.ui_obj.allow3DSPaymentsOny = false;
        }
        $("#threeDS_option").prop(that.DISABLED, !(result || that.FALSE === that.threeDS_option));
        $("#avs_option").prop(that.DISABLED,
                !(that.TRUE === that.threeDS_option && result && that.bt_utils.getAVSChallenges().length));

        return result;
    }

    function setIntegration(ui_type) {
        var url = "";

        switch (ui_type) {
        case that.DROPINUI:
            // setup a Dropin-UI integration
            that.ui_obj = new DropinUI(that.getIntegrationConf(ui_type));
            url = "drop-in/javascript/v2";
            $("#new_payment_method").click();
            $(".customer-payment-methods").addClass(that.HIDDEN);
            break;

        case that.CUSTOMUI:
            that.ui_obj = new CustomUI(that.getIntegrationConf(ui_type));
            url = "credit-cards/overview";
            break;

        case that.HOSTEDUI:
            that.ui_obj = new HostedFieldsUI(that.getIntegrationConf(ui_type));
            url = "hosted-fields/overview/javascript/v3";
            break;
        }

        if (that.DROPINUI !== ui_type) {
            $(".customer-payment-methods").removeClass(that.HIDDEN);
            $(".card-wrapper input:checked").trigger(that.CHANGE);
        }

        $("a.braintree").attr("href", "https://developers.braintreepayments.com/guides/" + url);

        // setup a 3DS filter
        init3DS();
    }

    function bindEvents() {
        $("#ui_selector").off(that.CHANGE).on(that.CHANGE, function() {
            var ui_type = $(this).val();

            that.update_theme_list(ui_type);

            that.loadCardTheme(that.theme_id, ui_type, function() {
                setIntegration(ui_type);
            });
        }).trigger(that.CHANGE);

        $("#threeDS_option").off(that.CHANGE).on(that.CHANGE, function() {
            that.threeDS_option = $(this).val();

            that.ui_obj.allow3DSPaymentsOny = that.TRUE === that.threeDS_option;
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
            if (that.DROPINUI !== $("#ui_selector").val()) {
                that.loadVaultPaymentMethods($(this).val(), function() {
                    $(".payment-method input").off(that.CHANGE).change(function() {
                        var s = $(".card-wrapper");
                        if (!($(this).val().length && s.is(":hidden"))) {
                            s.slideToggle();
                        }
                    });

                    $(".card-wrapper input:checked").trigger(that.CHANGE);
                });
            } else {
                that.loadVaultPaymentMethods();
            }

        }).trigger(that.CHANGE);

        $("#theme_options").off(that.CHANGE).on(that.CHANGE, function() {
            var ui_type = $("#ui_selector").val();

            that.theme_id = $(this).val();

            that.loadCardTheme(that.theme_id, ui_type, function() {
                setIntegration(ui_type);
            });
        });

    }

    // ///////////////////////////////
    // PRIVILEGED MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    this.name = "BraintreeApp";

    this.queue = 0;

    this.bt_utils = null;
    this.client_token = null;
    this.ui_obj = null;
    this.threeDS_option = $("#threeDS_option").val();
    this.avs_option = $("#avs_option").val();
    this.theme_id = "";

    this.tearDown = function() {

        if (that.ui_obj) {
            that.ui_obj.destroy(function() {
                delete that.ui_obj;
                that.ui_obj = null;
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
BraintreeApp.prototype.CUSTOMUI = "custom-ui"
BraintreeApp.prototype.DROPINUI = "drop-in-ui"
BraintreeApp.prototype.HOSTEDUI = "hosted-ui"
BraintreeApp.prototype.DISABLED = "disabled"
BraintreeApp.prototype.FALSE = "false"
BraintreeApp.prototype.TRUE = "true"

BraintreeApp.prototype.checkout = new Demo({
    formID : "payment-form",
    development : true
});

window["BraintreeApp"] = BraintreeApp;