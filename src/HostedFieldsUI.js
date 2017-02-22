"use strict";
/**
 * Wrapper class that integrates HostedFields UI (Braintree.js SDK v3) on a checkout page
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
 * @see {@link https://braintree.github.io/braintree-web/3.6.3/HostedFields.html}
 * 
 * @tutorial commonConf
 * @tutorial hostedFieldsUI
 * @tutorial threeDSecure
 */
function HostedFieldsUI(config) {
    BraintreeUI3.call(this, config);

    var that = this;

    var hostedFields = null;// the Braintree hosted fields instance

    var events = config.events || {};// hosted fields events

    /**
     * @since 1.0
     * @inheritdoc
     * @override
     * @default
     */
    this.integrationType = 'hosted-fields'; // this class Braintree integration type

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

        hostedFields.tokenize(function(err, result) {
            if (err) {
                that.processError(that.execModuleFn('utils', 'parseError', err));
                return;
            }

            var type = result.type || (result.creditCards && result.creditCards.length ? result.creditCards[0].type : '');
            that.onPaymentMethodReceived({
                nonce : result.nonce,
                type : type
            });
            return false;
        });

        return false;
    };

    /**
     * Binds the checkout {@link GenericIntegration#inputs|inputs} controls to the Braintree hosted fields integration
     * 
     * @since 1.0
     */
    this.createFields = function() {
        // helper function that maps the class configuration events to the hosted fields instance's events
        function assignEvents() {
            $.each(events, function(event, callback) {
                hostedFields.on(event, callback);
            });
        }

        var fields = {
            number : {
                selector : that.inputs.card_number,
                placeholder : $(that.inputs.card_number).attr('placeholder'),
                value : $(that.inputs.card_number).val()
            },
            expirationDate : {
                selector : that.inputs.expiry_date,
                type : 'month',
                placeholder : $(that.inputs.expiry_date).attr('placeholder')
            }
        };
        if (that.inputs.cvv_number && $(that.inputs.cvv_number).is(':visible')) {
            fields.cvv = {
                selector : that.inputs.cvv_number,
                placeholder : $(that.inputs.cvv_number).attr('placeholder')
            };
        }

        if (that.inputs.postal_code && $(that.inputs.postal_code).is(':visible')) {
            fields.postalCode = {
                selector : that.inputs.postal_code,
                placeholder : $(that.inputs.postal_code).attr('placeholder')
            };
        }

        braintree.hostedFields.create({
            client : that.client,
            fields : fields,
            styles : {
                'input' : {
                    'font-size' : '16px',
                    'max-height' : '2em'
                },
                '.valid' : {
                    'color' : 'green'
                }
            }
        }, function(err, hostedFieldsInstance) {
            if (err) {
                that.onError(that.execModuleFn('utils', 'parseError', err));

                return;
            }

            hostedFields = hostedFieldsInstance;

            that.onReady(hostedFieldsInstance);

            assignEvents();
        });
    };

    this.init();
}

HostedFieldsUI.prototype = Object.create(BraintreeUI3.prototype);
HostedFieldsUI.prototype.constructor = HostedFieldsUI;

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
HostedFieldsUI.prototype.postInit = function() {
    this.createFields();

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
