In this tutorial we will learn how to integrate a custom HTML checkout UI with a {@link DropinUI} Braintree integration.

Creating a Braintree Dropin UI checkout integration is straightforward:
- a HTML with a FORM and Dropin container
- a JavaScript script that binds the container to a Braintree Dropin UI object

Firstly create a simple HTML checkout form:
```html
<form id="payment-form" action="checkout.php">
  <div class="bt-drop-in-wrapper">
    <div id="bt-dropin"></div>
  </div>
  <input type="submit" value="Pay Now">
</form>
```

Secondly define a JavaScript that setup a Braintree DropinUI for our custom checkout above. Please prepend also the code shown on {@tutorial commonConf} tutorial.

```javascript
// copy the {@tutorial commonConf} to our DropinUI configuration
var conf = common;

// extend the default configuration
conf.container = "bt-dropin" // the Dropin container identifier

// setup our Dropin UI handler using the above configuration
var ui_obj = new DropinUI(conf);

// whenever clean-up is required
// ui_obj.destroy(function(){console.log("integration cleaned-up");});
```

By clicking the `Pay Now` button the DropinUI will intercept the form submit action and will:
1. tokenize the built-in card INPUT elements
  1. eventually will launch a 3DS authentication popup if 3DS enabled and 3DS-enrolled card (see the {@tutorial threeDSecure} tutorial)  
2. on success will:
  1. set the `payment_method_nonce` hidden field with a nonce coresponding to (1) above
  2. will submit the form to the backend app where we can create a Braintree [sale transaction](https://developers.braintreepayments.com/reference/request/transaction/sale/php) by using the `payment_method_nonce` value
3. on error will display an error alert message