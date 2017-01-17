(function() {
    "use strict";
    BraintreeApp.prototype.post_ajax_request = function(data, success, error) {
        var that = this;

        this.queue += 1;

        this.blockUI();

        $("body").ready(function() {
            $.ajax(ajaxurl, {
                method : "POST",
                accepts : "application/json;charset=utf-8",
                dataType : "json",
                data : data,
                headers : {
                    "X-WhoIAm" : that.name
                },
                success : function(data, textStatus, jqXHR) {
                    that.queue -= 1;
                    if (success) {
                        success(data, textStatus, jqXHR);
                    }
                    if (!that.queue) {
                        that.unBlockUI();
                    }
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    that.queue -= 1;
                    if (!that.queue) {
                        that.unBlockUI();
                    }

                    var msg = (textStatus.length ? textStatus + ": " : "") + errorThrown;

                    if (!(error && error(msg))) {
                        that.error_function(msg);
                    }
                }
            });
        });
    };

    BraintreeApp.prototype.loadVaultPaymentMethods = function(customer_id, ready) {
        var that = this;

        var selector = $(".customer-payment-methods-wrapper");

        if (selector.is(":visible")) {
            selector.slideToggle();
        }

        if (customer_id) {
            that.post_ajax_request({
                "action" : "get_payment_methods",
                "customerId" : customer_id
            }, function(data) {
                if (data["success"]) {
                    selector.html(data["html"]).slideToggle();
                } else if (data["error"]) {
                    that.error_function(data["error"]["message"]);
                }

                if (ready) {
                    ready(data);
                }

            }, function(jqXHR, textStatus, errorThrown) {
                var msg = (textStatus.length ? textStatus + ": " : "") + errorThrown;
                that.error_function(msg);
                selector.empty();
            });
        } else {
            selector.empty();
        }
    };

    BraintreeApp.prototype.set_token = function(customer_id) {
        var that = this;

        this.post_ajax_request({
            "action" : "get_token",
            "customerId" : customer_id
        }, function(data) {
            if (data["success"]) {
                that.init(data["token"]);
            } else if (data["error"]) {
                that.error_function(data["error"]["message"]);
            }
        });
    };

    BraintreeApp.prototype.get_id = function(item) {
        return this.name + "_" + item.replace(/\./g, "_").replace(/([\w\W]*\/)([\w\W]+)/, "$2");
    };

    BraintreeApp.prototype.unloadCardTheme = function() {
        $("head link[data-plugin=\"" + this.name + "\"]").remove();
        $("head script[data-plugin=\"" + this.name + "\"]").remove();
        this.tearDown();
    };

    BraintreeApp.prototype.loadCardTheme = function(theme_id, ui_type, ready) {
        var that = this;
        var monitor;

        this.unloadCardTheme();

        function loadTheme() {
            if ("undefined" === typeof theme_id) {
                return that.error_function("Cannot initialize card. Invalid theme_id");
            }

            var only_once = function(item) {
                return !$("head>#" + that.get_id(item)).length;
            };

            var to_style = function(item) {
                return "<link id=\"" + that.get_id(item) + "\" rel=\"stylesheet\" data-plugin=\"" + that.name + "\" href=\""
                        + item + "\" />";
            };

            var to_script = function(item) {
                return "<script id=\"" + that.get_id(item) + "\" data-plugin=\"" + that.name + "\" src=\"" + item + "\" />";
            };

            var addToHead = function(array, is_style) {
                $($.map($.map(array, function(a) {
                    return a;
                }).filter(only_once), function(item) {
                    return is_style ? to_style(item) : to_script(item);
                }).join("")).appendTo("head");
            };

            that.post_ajax_request({
                "action" : "get_card",
                "theme_id" : theme_id,
                "ui_type" : ui_type
            }, function(data) {
                if (data["success"]) {

                    $(".card-wrapper").html(data["html"]);

                    $($.map($.map(data["css"], function(a) {
                        return a;
                    }).filter(only_once), function(item) {
                        return to_style(item);
                    }).join("")).appendTo("head");

                    addToHead(data["css"], true);
                    addToHead(data["js"], false);

                } else if (data["error"]) {
                    that.error_function(data["error"]["message"]);
                }

                if (ready) {
                    ready(data);
                }
            });
        }

        // do not load the new theme while the unload is not done
        monitor = setInterval(function() {
            if (!that.ui_obj) {
                clearInterval(monitor);
                loadTheme();
            }
        }, 100);
    };

    BraintreeApp.prototype.update_theme_list = function(ui_type, ready) {
        var that = this;

        this.post_ajax_request({
            "action" : "get_theme_list",
            "ui_type" : ui_type
        }, function(data) {
            if (data["success"]) {
                var options = "";
                $.each(data["themes"], function(key, value) {
                    options += "<option value=\"" + key + "\">" + value + "</option>";
                });
                $("#theme_options").html(options);

            } else if (data["error"]) {
                that.error_function(data["error"]["message"]);
            }

            if (ready) {
                ready(data["themes"]);
            }
        });
    };
}());