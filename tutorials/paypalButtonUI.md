In this tutorial we will learn how to integrate a custom HTML checkout UI with a {@link PayPalButtonUI} Braintree integration.

Creating a Braintree PayPalButton UI checkout integration is straightforward:
- a HTML with a FORM with one DIV container for the PayPalButton button 
- a JavaScript script that binds the given container to a Braintree PayPalButton UI object

Firstly create a simple HTML checkout form:
```html
<form id="payment-form" action="checkout.php">
  <div class="bt-paypal-wrapper" style="padding: 10px"></div>
  <input type="submit" value="Pay Now">
</form>
```

Secondly define a JavaScript that setup a Braintree PayPalButtonUI for our custom checkout above. Please prepend also the code shown on {@tutorial commonConf} tutorial.

```javascript
// the PayPal button configuration for Braintree integration
var conf = {
  container: ".bt-paypal-wrapper",
  containerStyle: {
    css: {}
  },
  onGetCurrency: function() {
    return bt_utils.getAccountSettings("paypal.currencyIsoCode");
  },
  onPaymentMethodReceived: function() {},
  flow: "checkout",
  intent: "sale",
  useraction: "",
  enableShippingAddress: "false",
  shippingAddressEditable: "false",
  billingAgreementDescription: "",
  offerCredit: "false",
  displayName: "",
  locale: "en_US",
  // the real PayPal button look&feel
  buttonOptions: {
    color: "",
    size: "medium",
    shape: "pill",
    label: "Pay with {wordmark}",
    tagline: false,
    show_icon: true,
    locale: "en_US",
    disabled: false,
    type: "button",
    style: "primary",
    id: "foo"
  }
};

// extend the inputs of the default configuration
conf.inputs.amount = "#amount";
conf.inputs.deviceData = "deviceData";

// copy the common configuration to the PayPal configuration  
for (p in common) {
  if (!conf.hasOwnProperty(p) && common.hasOwnProperty(p)) {
    conf[p] = common[p];
  }
}

// setup our PayPalButton UI handler using the above configuration
var ui_obj = new PayPalButtonUI(conf);

// whenever clean-up is required
// ui_obj.destroy(function(){console.log("integration cleaned-up");});
```

> **Note**: Please note that this requires also the usage of the {@link https://github.com/eugenmihailescu/paypal-button-wrapper|PayPalButton} external class that will draw a PayPal button using a genuine PayPal button library.

By clicking the PayPal button a new PayPal authentication window will be show. On successful authentication will set the `payment_method_nonce` hidden field with a nonce coresponding to authentication PayPal user

By clicking the `Pay Now` button the PayPalButtonUI will intercept the form submit action and will:
1. will submit the form to the backend app where we can create a Braintree [sale transaction](https://developers.braintreepayments.com/reference/request/transaction/sale/php) by using the `payment_method_nonce` value
2. on error will display an error alert message