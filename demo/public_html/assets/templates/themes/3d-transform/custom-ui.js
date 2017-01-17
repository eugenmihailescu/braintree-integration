var bound = false;
var interval = setInterval(function() {
    if (InputMask) {
        bound || new InputMask({
            inputs : {
                '.bt-custom-ui-wrapper #card_number' : {
                    mask : '____ ____ ____ ____',
                    pattern : '[0-9]',
                    strict : true
                },
                '.bt-custom-ui-wrapper #card_expiry' : {
                    mask : '__/__',
                    pattern : '[0-9]',
                    strict : true
                },
                '.bt-custom-ui-wrapper #card_cvv' : {
                    mask : '____',
                    pattern : '[0-9]',
                    strict : true
                },
                '.bt-custom-ui-wrapper #card_postal_code' : {
                    mask : '_________',
                    pattern : '[0-9a-zA-Z ]',
                    strict : true
                }
            },
            mask_symbol : '_'
        });
        clearInterval(interval);
    }
}, 500);