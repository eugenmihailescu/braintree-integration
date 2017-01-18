# braintree-integration
A set of JavaScript classes for creating a checkout User Interface that works with Braintree Payment Gateway. It allows you to bind your own custom HTM checkout form and input elements (like card-number, expiry date, ccv, postal code) and it hijacks the form submit action on the fly by redirecting the form submission first to the Braintree payment gateway and in case of success to your form default action.

It provides also end-points for various events (like onReady, onError, onSuccess, on3DSFail, onBypass3DS, etc) which allows you to customize the status messages displayed on you application UI.

#Features
- support for Drop-in UI integration
- support for Hosted Fields UI integration
- support for Custom UI integration
- support for different checkout card layouts
- support for 3DS and AVS rules
- support for Customer Vault usage
- ongoing: PayPal button with Vault support (JS v3 SDK)

#Requirements
* jQuery
* desktop: IE9+,FF,Chrome,Opera,Safari8+
* IOS => mobile: Safari8+, Chrome48+; Android => Native browser 4.4+, Chrome, FF
* Braintree JS v3 SDK (except Drop-in integration where v2 SDK is the only one available as of January, 2017)

#Other  
A demo application is included. It makes use of the https://github.com/braintree/braintree_php_example.

This is an ongoing project so expect more...