"use strict";
/**
 * Generic class for Braintree ThreeDSecure authentication flow
 * 
 * @param config
 *            The default authentication configuration
 * 
 * @returns Object Returns an instance of our ThreeDSecure class
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

    // the instance to the Braintree ThreeDSecure object
    this.bt_threeDSecure = false;

    // the form inputs (here we need only access to `amount` field)
    this.inputs = config.inputs;

    // the 3DS authentication wrapper frame HTML elements
    this.frame3ds = config.frame3ds;

    // true if integration accepts 3DS cards only
    this.allow3DSPaymentsOny = config.allow3DSPaymentsOny || false;

    // overrides the `allow3DSPaymentsOny` option: if non-3DS card but merchant has AVS rules then accept the payment
    // (hopefully it will be validated by the gateway)
    this.ignore3DSIfAVS = config.ignore3DSIfAVS || false;

    // callback to notify after the 3DS instance is created|ready
    this.onReady = config.onReady || this.noop;

    // callback to notify when the user closes the 3DS popup
    this.onUserClose = config.onUserClose || this.noop;

    // callback to notify when 3DS liability cannot be shifted to bank
    this.onFailLiabilityShift = config.onFailLiabilityShift || this.noop

    // callback to notify when the AVS is tried due to 3DS liability shift failure
    this.onUseAVSLiabilityShiftFailed = config.onUseAVSLiabilityShiftFailed || this.noop

    // the helper function to remove the 3DS popup from our modal frame
    this.removeFrame = function(error, paymentMethod) {
        var iframe = that.frame3ds.bankFrame.children('iframe');
        that.frame3ds.modal.addClass(that.frame3ds.hidden);
        iframe.remove();
    };

    // launches the 3DS authentication popup
    this.verifyCard = function(data) {
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

    this.init();
}

ThreeDSecure.prototype = Object.create(BraintreeClient3.prototype);
ThreeDSecure.prototype.constructor = ThreeDSecure;

// the class default initialization
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