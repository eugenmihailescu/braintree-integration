"use strict";
/**
 * Helper utility class that parses a given encoded token object corresponding to an Braintree account and provides info about
 * account settings like 3DS and AVS support, errors, etc
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @since 1.0
 * @param {string}
 *            token - The base64 token that encapsulates the Braintree account settings.
 */
function BraintreeUtils(token) {
    var token = token;
    var that = this;

    /**
     * Convert the given argument to its true boolean value.
     * 
     * @since 1.0
     * @param {(string|number|boolean)}
     *            value - A boolean string value, a boolean value or a numeric value
     * 
     * @example BraintreeUtils.toBoolean("false"); // returns FALSE
     * 
     * BraintreeUtils.toBoolean(true); // returns TRUE
     * 
     * BraintreeUtils.toBoolean(1); // returns TRUE
     * 
     * @returns {boolean} Returns the true boolean value of argument
     */
    this.toBoolean = function(value) {
        return "true" === value || true === value || 1 === value;
    };

    /**
     * Decode a base64 Braintree encoded JSON-formatted token
     * 
     * @since 1.0
     * @param {string}
     *            token - The base64 Braintree encoded token
     * @return {Object} Returns a JSON object containing the info encoded within the given token on success, FALSE otherwise
     */
    this.decodeToken = function(token) {
        var result = false;
        if (token) {
            try {
                result = JSON.parse(window.atob(token));
            } catch (e) {
                console.log(e);
            }
        }

        return result;
    };

    var obj = this.decodeToken(token);

    /**
     * Check if the Braintree settings has 3DS enabled.
     * 
     * @since 1.0
     * @returns {boolean} - Returns TRUE on success, FALSE otherwise
     */
    this.is3DSEnabled = function() {
        var result = false;

        if (obj) {
            result = that.toBoolean(obj.threeDSecureEnabled);
        }

        return result;
    };

    /**
     * Check if the Braintree settings defines the given AVS rule name.
     * 
     * @since 1.0
     * @param {string=}
     *            value - The Braintree AVS challange name to check
     * @returns {(boolean|string[])} When value argument specified returns true|false if the value argument is within the
     *          Braintree AVS challanges, otherwise returns an array of Braintree AVS challanges
     */
    this.getAVSChallenges = function(value) {
        var result = [];

        if (obj) {
            if (Array.prototype.isPrototypeOf(obj.challenges)) {
                result = obj.challenges;
            } else {
                if (that.UNDEF !== typeof obj.challenges.postal_code) {
                    result.push('postal_code');
                }
                if (that.UNDEF !== typeof obj.challenges.street_address) {
                    result.push('street_address');
                }
                if (that.UNDEF !== typeof obj.challenges.cvv) {
                    result.push('cvv');
                }
            }
        }

        return "undefined" === typeof value ? result : result.indexOf(value) >= 0;
    };

    /**
     * Get the Braintree settings value associated with the given key.
     * 
     * @since 1.0
     * @param {string}
     *            key - The key which value is to be returned. To specify a nested key use the dot notation.
     * @returns {boolean|Object} Returns the value associate with the key on success, false otherwise
     * 
     * @example myBUtilInstance.getAccountSettings("paypal.currencyIsoCode"); // return "USD"
     */
    this.getAccountSettings = function(key) {
        var keys = key.split(".");
        var result = obj;

        keys.forEach(function(k) {
            if (!result[k]) {
                result = false;
                return;
            }
            result = result[k];
        });

        return result;
    };

    /**
     * Parse a Braintree.js v2|v3 SDK error and return a complete error message
     * 
     * @since 1.0
     * @param {string|Object}
     *            err - The error string|object to parse. When an Object is provided then it should be compatible with
     *            {@link https://github.com/braintree/braintree-web|Braintree.js} error.
     * @returns {string} Returns an error message for the given input argument
     */
    this.parseError = function(err) {
        if ("object" !== typeof err) {
            return err;
        }

        var msg = [ err.message ];

        // helper iterative function for nested field error messages
        var renderFieldErrors = function(err) {
            var result = "";
            err.forEach(function(field) {
                if (field.fieldErrors) {
                    result += field.field + "." + renderFieldErrors(field.fieldErrors);
                } else if (field.field) {
                    result = field.field + ":" + (field.message || "") + (field.code ? "(" + field.code + ")" : "") + "\n";
                }
            });
            return result;
        };

        if (err.details) {
            var fragments = [];
            if (err.details.originalError) {

                // SDKv3 error
                if (err.details.originalError.error) {
                    var tds = err.details.originalError.threeDSecureInfo ? "3DS:" : "";
                    var m = [ err.message ];

                    m.push(err.details.originalError.error.message);
                    msg.push(tds + m.join(" "));
                }

                var rawRequestError = err.details.originalError;

                if (rawRequestError.fieldErrors) {
                    fragments = rawRequestError.fieldErrors[0].fieldErrors;
                }
            } else if (err.details.fieldErrors) {
                fragments = err.details.fieldErrors;
            }

            if (fragments.lenght) {
                msg.push(renderFieldErrors(fragments));
            }

        }

        // HostedFields SDKv3 specific error
        if (err.code) {
            switch (err.code) {
            case "HOSTED_FIELDS_FIELDS_INVALID":
                msg.push(err.details.invalidFieldKeys.join(","));
                break;
            }
        }

        // SDKv2 kind of error
        if (err.type) {
            var statusCode = err.statusCode ? "[" + err.statusCode + "] " : "";
            switch (err.type) {
            case "CONFIGURATION":
            case "VALIDATION":
            case "SERVER":
                if (err.details.invalidFields) {
                    msg.push(statusCode + err.details.invalidFields.map(function(item) {
                        return item.fieldKey + (item.isEmpty ? "=?" : "");
                    }).join(","));
                } else if (err.details.fieldErrors) {
                    msg.push(statusCode + renderFieldErrors(err.details.fieldErrors));
                }
                break;
            }

        }

        return (err.type ? err.type + ":" : "") + msg.join("<br>");
    };
}
