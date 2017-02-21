(function() {
    "use strict";

    BraintreeApp.prototype.getSharedConf = function() {
        return {
            token : this.client_token,
            form : $("#payment-form"),
            allow3DSPaymentsOny : this.TRUE === this.threeDS_option,
            ignore3DSIfAVS : this.TRUE === this.avs_option,
            inputs : {
                paymentToken : "input[name=\"payment_method_token\"]:checked",
                paymentNonce : "payment_method_nonce",
                non3DSPayment : "non_3ds_payment"
            },
            onError : this.error_function,
            modules : {
                "utils" : {
                    instance : this.bt_utils,
                    exports : [ "decodeToken", "is3DSEnabled", "getAVSChallenges", "parseError", "toBoolean",
                            "getAccountSettings" ]
                }
            }
        };
    };

    BraintreeApp.prototype.getIntegrationConf = function(ui_type) {
        var that = this;

        var shared_conf = this.getSharedConf();
        var result = {};

        var cardInputs = {
            card_number : ".bt-" + ui_type + "-wrapper #card_number",
            cvv_number : ".bt-" + ui_type + "-wrapper #card_cvv",
            expiry_date : ".bt-" + ui_type + "-wrapper #card_expiry",
            postal_code : ".bt-" + ui_type + "-wrapper #card_postal_code",
            street_address : "#street_address"
        };

        switch (ui_type) {
        case that.PAYPALBUTTON:
            result.paypal = shared_conf;
            delete result.paypal.allow3DSPaymentsOny;
            delete result.paypal.ignore3DSIfAVS;
            $.extend(result.paypal, {
                container : ".bt-paypal-wrapper",
                containerStyle : {
                    css : {}
                },
                onGetCurrency : function() {
                    return that.bt_utils.getAccountSettings("paypal.currencyIsoCode");
                },
                inputs : $.extend(result.paypal.inputs, {
                    amount : "#amount",
                    deviceData : "deviceData"
                })
            }, that.paypalOptions);
            break;
        case that.DROPINUI:
            result.card = shared_conf;
            $.extend(result.card, {
                container : "bt-dropin"
            });
            // we drop the paymentToken as it"s not used by Drop-in class
            delete result.card.inputs.paymentToken;
            break;
        case that.CUSTOMUI:
            result.card = shared_conf;
            $.extend(result.card, {
                id : "payment-form",
                inputs : $.extend({}, result.card.inputs, cardInputs)
            });
            break;
        case that.HOSTEDUI:
            result.card = shared_conf;
            $.extend(result.card, {
                inputs : $.extend({}, result.card.inputs, cardInputs),
                events : {
                    "blur" : function(event) {
                        console.log(event.emittedBy, "lost focus");
                    },
                    "cardTypeChange" : function(event) {
                        if (event.cards.length === 1) {
                            console.log(event.cards[0].type);
                        } else {
                            console.log("Type of card not yet known");
                        }
                    },
                    "empty" : function(event) {
                        console.log(event.emittedBy, "is now empty");
                    },
                    "focus" : function(event) {
                        console.log(event.emittedBy, "gained focus");
                    },
                    "inputSubmitRequest" : function() {
                        // User requested submission, e.g. by pressing Enter or equivalent
                    },
                    "notEmpty" : function(event) {
                        console.log(event.emittedBy, "is now not empty");
                    },
                    "validityChange" : function(event) {
                        var field = event.fields[event.emittedBy];

                        if (field.isValid) {
                            console.log(event.emittedBy, "is fully valid");
                        } else if (field.isPotentiallyValid) {
                            console.log(event.emittedBy, "is potentially valid");
                        } else {
                            console.log(event.emittedBy, "is not valid");
                        }
                    }
                }
            });
            break;
        case "3ds":
            result.threeds = shared_conf;
            $.extend(result.threeds, {
                inputs : {
                    amount : "#amount"
                },
                frame3ds : {
                    bankFrame : $(".bt-modal-body"),
                    modal : $("#modal"),
                    hidden : that.HIDDEN,
                    closeBtn : $("#text-close")
                },
                onReady : that.ui_obj.card.set3DSecure,
                onError : that.ui_obj.card.processError,
                onUserClose : function() {
                    that.ui_obj.card.onError("3DS aborted by user");
                },
                onFailLiabilityShift : function(response) {
                    that.ui_obj.card.onError("3DS liability shift failed");
                    console.log(response);
                },
                onUseAVSLiabilityShiftFailed : function(response) {
                    that.ui_obj.card.onError("3DS liability shift failed => we relay on AVS rules ("
                            + that.bt_utils.getAVSChallenges().join(",") + ")");
                    console.log(response);
                }
            });
            break;
        case that.HOSTEDUI_PAYPAL:
            result = $.extend(that.getIntegrationConf(that.PAYPALBUTTON), that.getIntegrationConf(that.HOSTEDUI));
            result.card.inputs = $.extend({}, result.card.inputs, cardInputs);
            break;
        }

        return result;
    };
}());
