In this tutorial we will learn how to integrate a custom HTML checkout UI with a {@link HostedFieldsUI} Braintree integration.

Creating a Braintree HostedFields UI checkout integration is straightforward:
- a HTML with a FORM with one DIV container for each needed hosted INPUT field 
- a JavaScript script that binds the container to a Braintree HostedFields UI object

Firstly create a simple HTML checkout form:
```html
<form id="payment-form" action="checkout.php">
  <div class="bt-hosted-ui-wrapper">
    <div class="hosted-input card-number-wrapper">
      <label class="input-label" for="card_number">Card number</label>
      <div id="card_number" placeholder="•••• •••• •••• ••••" class="input-field"></div>
    </div>
    <div class="hosted-input card-expiry-wrapper">
      <label for="card_expiry" class="input-label">Expiry date</label>
      <div id="card_expiry" placeholder="MM/YY" class="input-field"></div>
    </div>
    <div class="hosted-input card-cvv-wrapper">
      <label for="card_cvv" class="input-label">CVV</label>
      <div id="card_cvv" placeholder="••••" class="input-field"></div>
    </div>
<!-- optionally input fields
    <div class="hosted-input card-postal-code-wrapper">
      <label for="card_postal_code" class="input-label">Postal Code</label>
      <div id="card_postal_code" placeholder="Postal code" class="input-field"></div>
    </div>
-->    
  </div>
  <input type="submit" value="Pay Now">
</form>
```

Secondly define a JavaScript that setup a Braintree DropinUI for our custom checkout above. Please prepend also the code shown on {@tutorial commonConf} tutorial.

```javascript
// copy the {@tutorial commonConf} to our DropinUI configuration
var conf = common;

// extend the default configuration
conf.events = {
  "blur": function(event) {
    console.log(event.emittedBy, "lost focus");
  },
  "cardTypeChange": function(event) {
    if (event.cards.length === 1) {
      console.log(event.cards[0].type);
    } else {
      console.log("Type of card not yet known");
    }
  },
  "empty": function(event) {
    console.log(event.emittedBy, "is now empty");
  },
  "focus": function(event) {
    console.log(event.emittedBy, "gained focus");
  },
  "inputSubmitRequest": function() {
    // User requested submission, e.g. by pressing Enter or equivalent
  },
  "notEmpty": function(event) {
    console.log(event.emittedBy, "is now not empty");
  },
  "validityChange": function(event) {
    var field = event.fields[event.emittedBy];

    if (field.isValid) {
      console.log(event.emittedBy, "is fully valid");
    } else if (field.isPotentiallyValid) {
      console.log(event.emittedBy, "is potentially valid");
    } else {
      console.log(event.emittedBy, "is not valid");
    }
  }
};

// setup our Dropin UI handler using the above configuration
var ui_obj = new HostedFieldsUI(conf);

// whenever clean-up is required
// ui_obj.destroy(function(){console.log("integration cleaned-up");});
```

By clicking the `Pay Now` button the HostedFieldsUI will intercept the form submit action and will:
1. tokenize the hosted INPUT field elements
  1. eventually will launch a 3DS authentication popup if 3DS enabled and 3DS-enrolled card (see the {@tutorial threeDSecure} tutorial)  
2. on success will:
  1. set the `payment_method_nonce` hidden field with a nonce coresponding to (1) above
  2. will submit the form to the backend app where we can create a Braintree [sale transaction](https://developers.braintreepayments.com/reference/request/transaction/sale/php) by using the `payment_method_nonce` value
3. on error will display an error alert message