"use strict";

function BraintreeUtils(token) {
    var token = token;
    var that = this;

    this.toBoolean = function(value) {
        return "true" === value || true === value;
    };

    /**
     * Decode a base64 encoded JSON-formatted token
     * 
     * @public
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
     * Check if settings (given by class token) has 3DS enabled
     * 
     * @public
     */
    this.is3DSEnabled = function() {
        var result = false;

        if (obj) {
            result = that.toBoolean(obj.threeDSecureEnabled);
        }

        return result;
    };

    /**
     * Check if settings (given by class token) has some AVS rules defined
     * 
     * @public
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
     * Get the value associated with the key from the Braintree decoded token
     * 
     * @param string
     *            key The key which value is to return. To specify a nested key use the dot notation.
     * @return Returns the value associate with the key on success, false otherwise
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
     * Parse a Braintree.js error and return a complete error message
     * 
     * @public
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
