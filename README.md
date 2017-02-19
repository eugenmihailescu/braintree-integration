# braintree-integration
A set of JavaScript classes that integrates your custom checkout UI with the Braintree Payment Gateway. It allows you to bind your own custom HTML checkout form (with input elements like card-number, expiry date, ccv, postal code) and submit a tokenized payment method nonce (instead their raw values) to the original form default action. This makes your Braintree payment integration [PCI-DSS](https://articles.braintreepayments.com/reference/security/pci-compliance) compliant. 

In order to allow full customization of various events it provides also end-points for many events like onReady, onError, onSuccess, on3DSFail, onBypass3DS, etc which allows you to customize the status messages displayed on you application UI.

![class-diagram](http://yuml.me/d64b0fe6)

## Features
- support for [Drop-in UI](https://developers.braintreepayments.com/guides/drop-in/javascript/v2) integration
- support for [Hosted Fields UI](https://developers.braintreepayments.com/guides/hosted-fields/overview/javascript/v3) integration
- support for Custom UI integration
- support for different checkout card layouts
- support for [3DS](https://developers.braintreepayments.com/guides/3d-secure/overview) and [AVS rules](https://articles.braintreepayments.com/support/guides/fraud-tools/basic/avs-cvv-rules)
- support for [Customer Vault](https://articles.braintreepayments.com/control-panel/vault/overview) usage
- support for [PayPal UI](https://articles.braintreepayments.com/guides/paypal/overview) with [Vault](https://articles.braintreepayments.com/control-panel/vault/overview) support (JS v3 SDK)
    - see also the [paypal-button-wrapper](https://github.com/eugenmihailescu/paypal-button-wrapper) project
- support for [PayPal UI](https://articles.braintreepayments.com/guides/paypal/overview) with [Vault](https://articles.braintreepayments.com/control-panel/vault/overview) support (JS v3 SDK)
    - see also the [paypal-button-wrapper](https://github.com/eugenmihailescu/paypal-button-wrapper) project

## Requirements
* jQuery (with a small effort it can be decoupled from it)
* desktop: IE9+,FF,Chrome,Opera,Safari8+
* IOS => mobile: Safari8+, Chrome48+; Android => Native browser 4.4+, Chrome, FF
* [Braintree JS v3 SDK](https://braintree.github.io/braintree-web/3.8.0/index.html) (except Drop-in integration where [v2 SDK](https://js.braintreegateway.com/js/braintree-2.30.0.js) is the only one available as of January, 2017)

## Other  
A demo application is included. It makes use of the [https://github.com/braintree/braintree_php_example](https://github.com/braintree/braintree_php_example).

This is an ongoing project so expect more...