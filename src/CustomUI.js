"use strict";
/**
 * Class for HostedFields UI integration (Braintree.js SDK v3)
 * 
 * @param config
 *            The class default configuration
 * @returns
 */
function CustomUI(config) {
    BraintreeUI3.call(this, config);

    var that = this;

    this.integrationType = 'custom'; // this class Braintree integration type

    this.id = config.id; // the checkout form ID attribute

    // validate the card and get a payment nonce
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
                var renderFieldErrors = function(err) {
                    err.forEach(function(field) {
                        if (field.fieldErrors) {
                            renderFieldErrors(field.fieldErrors);
                        } else if (field.field in that.inputs) {
                            that.processError(field.message);
                        }
                    });
                };

                var rawRequestError = err.details.originalError;

                if (rawRequestError.fieldErrors && rawRequestError.fieldErrors.length > 0) {
                    renderFieldErrors(rawRequestError.fieldErrors[0].fieldErrors);
                } else {
                    console.log(err);
                    that.processError('Something unexpected went wrong.');
                }
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

// functions which are run right after initialization
CustomUI.prototype.postInit = function() {
    $(this.form).submit(this.tokenizeCard);
};

