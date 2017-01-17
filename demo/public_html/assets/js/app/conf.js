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
                    exports : [ "decodeToken", "is3DSEnabled", "getAVSChallenges", "parseError" ]
                }
            }
        };
    };

    BraintreeApp.prototype.getIntegrationConf = function(ui_type) {
        var that = this;

        var result = this.getSharedConf();

        var cardInputs = {
            card_number : ".bt-" + ui_type + "-wrapper #card_number",
            cvv_number : ".bt-" + ui_type + "-wrapper #card_cvv",
            expiry_date : ".bt-" + ui_type + "-wrapper #card_expiry",
            postal_code : ".bt-" + ui_type + "-wrapper #card_postal_code",
            street_address : "#street_address"
        };

        switch (ui_type) {
        case that.DROPINUI:
            $.extend(result, {
                container : "bt-dropin"
            });
            // we drop the paymentToken as it"s not used by Drop-in class
            delete result.inputs.paymentToken;
            break;
        case that.CUSTOMUI:
            $.extend(result, {
                id : "payment-form",
                inputs : $.extend({}, result.inputs, cardInputs)
            });
            break;
        case that.HOSTEDUI:
            $.extend(result, {
                inputs : $.extend({}, result.inputs, cardInputs),
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
            $.extend(result, {
                inputs : {
                    amount : "#amount"
                },
                frame3ds : {
                    bankFrame : $(".bt-modal-body"),
                    modal : $("#modal"),
                    hidden : that.HIDDEN,
                    closeBtn : $("#text-close")
                },
                onReady : that.ui_obj.set3DSecure,
                onError : that.ui_obj.processError,
                onUserClose : function() {
                    that.ui_obj.onError("3DS aborted by user");
                },
                onFailLiabilityShift : function(response) {
                    that.ui_obj.onError("3DS liability shift failed");
                    console.log(response);
                },
                onUseAVSLiabilityShiftFailed : function(response) {
                    that.ui_obj.onError("3DS liability shift failed => we relay on AVS rules ("
                            + that.bt_utils.getAVSChallenges().join(",") + ")");
                    console.log(response);
                }
            });
            break;
        }

        return result;
    };
}());