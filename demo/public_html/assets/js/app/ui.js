(function() {
    "use strict";

    BraintreeApp.prototype.blockUI = function() {
        $("#loading").removeClass(BraintreeApp.prototype.HIDDEN);
    };

    BraintreeApp.prototype.unBlockUI = function() {
        $("#loading").addClass(BraintreeApp.prototype.HIDDEN);
    };

    BraintreeApp.prototype.error_function = function(message) {
        $(".notice-wrapper").html(
                "<div class=\"show notice error notice-error\"><span class=\"notice-message\">" + message + "</span></div>");

        // note that this function executes from within different classes so we cannot use `this` argument
        // instead the BraintreeApp.prototype must be used to access BraintreeApp static methods
        BraintreeApp.prototype.checkout.notify("error");

        $("button[type=\"submit\"]").val("Test Transaction").removeAttr(BraintreeApp.prototype.DISABLED);

        BraintreeApp.prototype.unBlockUI();
    };
}());