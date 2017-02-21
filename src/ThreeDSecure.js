"use strict";
/**
 * Wrapper class for Braintree ThreeDSecure authentication flow
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param config
 *            The default authentication configuration
 * 
 * @see https://braintree.github.io/braintree-web/3.6.3/ThreeDSecure.html
 */
function ThreeDSecure(config) {
    // super class constructor
    BraintreeClient3.call(this, config);

    // /////////////////////////////
    // PRIVATE METHODS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    var that = this;

    // returns true if the `data` shows the liability shifted to bank
    function isLiabilityShifted(data) {
        var result = data.liabilityShifted || data.liabilityShiftPossible;
        result = result
                || (data.verificationDetails && (data.verificationDetails.liabilityShifted || data.verificationDetails.liabilityShiftPossible));
        return result;
    }

    // the helper function to integrate the 3DS popup in our modal frame
    function addFrame(err, iframe) {
        if (that.frame3ds) {
            that.frame3ds.bankFrame.append($(iframe));
            that.frame3ds.modal.removeClass(that.frame3ds.hidden);
        }
    }

    // ///////////////////////////////
    // PRIVILEGED MEMBERS & FUNCTIONS
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    /**
     * The instance to the Braintree ThreeDSecure object
     * 
     * @since 1.0
     * @member {Object}
     * @default
     */
    this.bt_threeDSecure = false;

    /**
     * The form inputs (here we need only access to `amount` field)
     * 
     * @since 1.0
     * @member {Object}
     * @property {string} amount - The jQuery selector for the amount HTML element
     */
    this.inputs = config.inputs;

    /**
     * The 3DS authentication wrapper frame HTML elements as provided via the constructor's {@link ThreeDSecure|configuration}
     * 
     * @since 1.0
     * @member {Object}
     * @property {Object} bankFrame - The inner jQuery object that represents the 3DS bank frame body (eg. a DIV)
     * @property {Object} modal - The outer jQuery object that represents the 3DS bank modal frame (eg. a DIV)
     * @property {string} hidden - The CSS class name used to hide the 3DS bank frame
     * @property {Object} closeBtn - The jQuery object that represents the 3DS bank frame close button
     */
    this.frame3ds = config.frame3ds;

    /**
     * Set to true if integration accepts 3DS cards only
     * 
     * @since 1.0
     * @member {boolean}
     * @default false
     */
    this.allow3DSPaymentsOny = config.allow3DSPaymentsOny || false;

    /**
     * Overrides the {@link ThreeDSecure#allow3DSPaymentsOny} option: if non-3DS card but merchant has AVS rules then accept
     * the payment. Hopefully it will be validated by the gateway.
     * 
     * @since 1.0
     * @member {boolean}
     * @default false
     */
    this.ignore3DSIfAVS = config.ignore3DSIfAVS || false;

    /**
     * Callback to notify after the 3DS instance is created|ready
     * 
     * @since 1.0
     * @member {callback}
     * @default {@link ConfiguredClass#noop|noop}
     */
    this.onReady = config.onReady || this.noop;

    /**
     * Callback to notify when the user closes the 3DS popup
     * 
     * @since 1.0
     * @member {callback}
     * @default {@link ConfiguredClass#noop|noop}
     */
    this.onUserClose = config.onUserClose || this.noop;

    /**
     * Callback to notify when 3DS liability cannot be shifted to bank
     * 
     * @since 1.0
     * @member {callback}
     * @default {@link ConfiguredClass#noop|noop}
     */
    this.onFailLiabilityShift = config.onFailLiabilityShift || this.noop

    /**
     * Callback to notify when the AVS is tried due to 3DS liability shift failure
     * 
     * @since 1.0
     * @member {callback}
     * @default {@link ConfiguredClass#noop|noop}
     */
    this.onUseAVSLiabilityShiftFailed = config.onUseAVSLiabilityShiftFailed || this.noop

    /**
     * The Remove the 3DS popup from our modal frame
     * 
     * @since 1.0
     * @function
     * @param {Object}
     *            error - The Braintree error object passed to the function when called
     * @param {string}
     *            paymentMethod - The payment method passed that called this function
     */
    this.removeFrame = function(error, paymentMethod) {
        var iframe = that.frame3ds.bankFrame.children('iframe');
        that.frame3ds.modal.addClass(that.frame3ds.hidden);
        iframe.remove();
    };

    /**
     * Launches the 3DS authentication popup
     * 
     * @since 1.0
     * @param {Object}
     *            data - An object that contains the paymentMethodInfo and the callback used while calling the
     *            {@link https://braintree.github.io/braintree-web/3.6.3/ThreeDSecure.html#verifyCard|Braintree's verifyCard}
     *            method
     * @see GenericIntegration#onPaymentMethodReceived
     * @example myInstance.verifyCard({ paymentMethodInfo: { nonce: "5wh9memdzg", type: "CreditCard" }, onSuccess:
     *          function(nonce) {}, onError: function() {}, onBypass3DS: function(response) {} });
     */
    this.verifyCard = function(data) {
        if (!that.is_available()) {
            return;
        }

        that.bt_threeDSecure.verifyCard({
            amount : $(that.inputs.amount).val(),
            nonce : data.paymentMethodInfo.nonce,
            addFrame : addFrame,
            removeFrame : that.removeFrame
        }, function(err, response) {
            if (err) {
                that.onError(that.execModuleFn('utils', 'parseError', err));
                return;
            }

            var success = isLiabilityShifted(response);

            if (!success && that.ignore3DSIfAVS && that.execModuleFn('utils', 'getAVSChallenges').length) {
                success = data.onBypass3DS ? data.onBypass3DS(response) : true;

                if (that.onUseAVSLiabilityShiftFailed) {
                    that.onUseAVSLiabilityShiftFailed(response);
                }
            }

            success = success || !that.allow3DSPaymentsOny;

            if (!success) {
                data.onError();
                that.onFailLiabilityShift(response);
            } else {
                data.onSuccess(response.nonce);
            }
        });
    };

    /**
     * Check whether the 3DS is available
     * 
     * @since 1.0
     * @returns {boolean} Returns true if 3DS authentication is available, false otherwise
     * @see {@link ThreeDSecure#bt_threeDSecure|bt_threeDSecure}
     */
    this.is_available = function() {
        return that.bt_threeDSecure !== false;
    };

    this.init();
}

ThreeDSecure.prototype = Object.create(BraintreeClient3.prototype);
ThreeDSecure.prototype.constructor = ThreeDSecure;

/**
 * @since 1.0
 * @inheritdoc
 * @override
 */
ThreeDSecure.prototype.init = function() {
    var that = this;
    this.frame3ds.closeBtn.off('click').on('click', function() {
        that.bt_threeDSecure.cancelVerifyCard(that.removeFrame);
        that.onError();
        that.onUserClose();
    });

    this.onClientReady = function(clientInstance) {
        braintree.threeDSecure.create({
            client : clientInstance
        }, function(threeDSecureErr, threeDSecureInstance) {
            if (threeDSecureErr) {
                that.onError(threeDSecureErr.message);
                return;
            }

            that.bt_threeDSecure = threeDSecureInstance;

            that.onReady(that);
        });
    };

    BraintreeClient3.prototype.init.call(this);
};