Below is the common configuration used by {@tutorial customUI}, {@tutorial dropinUI}, {@tutorial hostedFieldsUI}, {@tutorial threeDSecure}, {@tutorial paypalButtonUI} tutorials:

```javascript
// error handler
function showError(error) {
  console.log(error);
}

// this is a fake token; you should {@link https://developers.braintreepayments.com/reference/request/client-token/generate/php|generate a server-side Braintree client token} instead!
var client_token = "eyJ3aGF0IjoiYSB0b2tlbml6ZWQgQnJhaW50cmVlIGFycmF5In0=";

// an helper module used for various functions   
var bt_utils = new BraintreeUtils(client_token);

// common configuration
var common = {
  token: client_token,
  form: $("#payment-form"), // the form object given by Id
  allow3DSPaymentsOny: true, // enabled the 3DS popup
  ignore3DSIfAVS: false, // 3DS is mandatory, set to TRUE to make it optionally
  inputs: {
    card_number: "#card_number",
    cvv_number: "#card_cvv",
    expiry_date: "#card_expiry",
    postal_code: "#card_postal_code",
    street_address: "#street_address",
    paymentToken: "input[name=payment_method_token]:checked", // when checked then uses a vaulted payment token instead of card/expiry/cvv input values
    paymentNonce: "payment_method_nonce", // the name of hidden input that will host the payment method nonce which should be used by the backend app instead of card|expiry|cvv values 
    non3DSPayment: "non_3ds_payment" // the name of the hidden input that will signal the fact that 3DS handshake failed 
  },
  onError: showError,
  modules: { // define the available external helper modules
    "utils": { // access the exported function of the `utils` module
      instance: bt_utils,
      exports: ["decodeToken", "is3DSEnabled", "getAVSChallenges", "parseError", "toBoolean", "getAccountSettings"]
    }
  }
};
```