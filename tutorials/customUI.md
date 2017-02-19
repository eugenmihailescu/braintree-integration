In this tutorial we will learn how to integrate a custom HTML checkout UI with a {@link CustomUI} Braintree integration.

Creating a Braintree Custom UI checkout integration is straightforward:
- a HTML with a FORM and a card number, expiry date and cvv INPUT elements (optionally a `postal_code`, `street_address` or a vaulted token might be used)
- a JavaScript script that binds the INPUT elements to a Braintree Custom UI object

Firstly create a simple HTML checkout form:
```html
<form id="payment-form" action="checkout.php">
  <label for="card_number">Number</label>
  <input id="card_number" type="text">

  <label for="card_expiry">Expiry date</label>
  <input id="card_expiry" type="text">

  <label for="card_cvv">CVV</label>
  <input id="card_cvv" type="text">

  <label for="amount">Amount</label>
  <input id="amount" name="amount" type="text">
  <!-- optionally input fields
	<input id="card_postal_code" name="card_postal_code" type="text">
	<input id="street_address" name="street_address" type="text">
	<input name="payment_method_token" type="checkbox">
-->
  <input type="submit" value="Pay Now">
</form>
```

> **Note**: make sure the card fields does not have name attribute set (we don't want to have the customer's card info on ous server, it's safe that way!)

Secondly define a JavaScript that setup a Braintree CustomUI for our custom checkout above. Please prepend also the code shown on {@tutorial commonConf} tutorial.

```javascript
// copy the {@tutorial commonConf} to our CustomUI configuration
var conf = common;

// extend the default configuration
conf.id = "payment-form" // the checkout form identifier

// setup our Custom UI handler using the above configuration
var ui_obj = new CustomUI(conf);

// whenever clean-up is required
// ui_obj.destroy(function(){console.log("integration cleaned-up");});
```

By clicking the `Pay Now` button the CustomUI will intercept the form submit action and will:
1. tokenize the card INPUT elements
  1. eventually will launch a 3DS authentication popup if 3DS enabled and 3DS-enrolled card (see the {@tutorial threeDSecure} tutorial)  
2. on success will:
  1. set the `payment_method_nonce` hidden field with a nonce coresponding to (1) above
  2. will submit the form to the backend app where we can create a Braintree [sale transaction](https://developers.braintreepayments.com/reference/request/transaction/sale/php) by using the `payment_method_nonce` value
3. on error will display an error alert message