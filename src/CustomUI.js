"use strict";
/**
 * Wrapper class that integrates Custom UI (Braintree.js SDK v3) on a checkout page
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @extends BraintreeUI3
 * @since 1.0
 * @param {Object}
 *            config - Default class configuration
 * 
 * @tutorial commonConf
 * @tutorial customUI
 * @tutorial threeDSecure
 */
function CustomUI(config) {
    BraintreeUI3.call(this, config);

    var that = this;

    /**
     * @since 1.0
     * @inheritdoc
     * @override
     * @default
     */
    this.integrationType = 'custom'; // this class Braintree integration type

    /**
     * The checkout form ID attribute as provided by the constructor's {@link CustomUI|configuration}
     * 
     * @since 1.0
     * @member {string}
     */
    this.id = config.id;

    /**
     * Tokenize the card {@link GenericIntegration#inputs|inputs}. On success passes a Braintree payment method nonce to the
     * {@link GenericIntegration#onPaymentMethodReceived|onPaymentMethodReceived} callback otherwise pass an error to the
     * {@link GenericIntegration#onError|onError} callback
     * 
     * @since 1.0
     * @returns {boolean} Returns true if no tokenization is needed (eg. when using a Vault payment token), false otherwise
     */
    this.tokenizeCard = function() {
        var paymentToken = $(that.inputs.paymentToken);
        // we are using a payment token => let the form submit its fields
        if (paymentToken.length && paymentToken.val().length) {
            return true;
        }

        var data = {
            creditCard : {
                number : $(that.inputs.card_number).val(),
                expirationDate : $(that.inputs.expiry_date).val(),
                options : {
                    validate : false
                }
            }
        };

        if (that.inputs.cvv_number) {
            data.creditCard.cvv = $(that.inputs.cvv_number).val();
        }
        if (that.inputs.postal_code || that.inputs.street_address) {
            data.creditCard.billingAddress = {};
            if (that.inputs.postal_code && $(that.inputs.postal_code).is(':visible')) {
                data.creditCard.billingAddress.postalCode = $(that.inputs.postal_code).val();
            }
            if (that.inputs.street_address && $(that.inputs.street_address).is(':visible')) {
                data.creditCard.billingAddress.street_address = $(that.inputs.street_address).val();
            }

            if (Object.keys(data.creditCard.billingAddress).length > 0) {
                delete data.creditCard.billingAddress;
            }
        }

        that.client.request({
            endpoint : 'payment_methods/credit_cards',
            method : 'post',
            data : data
        }, function(err, result) {
            if (err) {
                that.onError(that.execModuleFn('utils', 'parseError', err));
                return;
            }

            var type = result.type || (result.creditCards && result.creditCards.length ? result.creditCards[0].type : '');

            that.onPaymentMethodReceived({
                nonce : result.creditCards[0].nonce,
                type : type
            });
        });

        return false;
    };

    this.init();
}

CustomUI.prototype = Object.create(BraintreeUI3.prototype);
CustomUI.prototype.constructor = CustomUI;

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
CustomUI.prototype.postInit = function() {
    var that = this;
    var init = function() {
        $(that.form).on("submit", that.tokenizeCard);
    }

    // for cases when PayPal button and HostedFields are mutual exclusive
    $("body").on("init_paypal_payment", function() {
        $(that.form).off("submit");
    });
    $("body").on("cancel_paypal_payment", function() {
        init();
    });

    init();
};
