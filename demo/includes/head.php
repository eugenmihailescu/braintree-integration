<head>
<title>BraintreePHPExample</title>
<link rel="icon" href="assets/img/favicon.png">
<link rel=stylesheet type=text/css href="assets/css/app.css">
<link rel=stylesheet type=text/css href="assets/css/overrides.css">
<link rel=stylesheet type=text/css href="assets/css/3dsframe.css">

<?php foreach (glob(__DIR__.'/../public_html/assets/js/vendor/jquery*.min.js') as $filename)printf("<script src=\"assets/js/vendor/%s\"></script>",basename($filename));?>
<script src="assets/js/demo.js"></script>

<style type="text/css">
.bt-hosted-ui-wrapper iframe {
	max-height: 2em;
}

.bt-hosted-ui-wrapper label {
	padding: 0 !important;
	border: 0 !important;
}

.bt-hosted-ui-wrapper .input-label {
	font-size: 12px;
}

.bt-hosted-ui-wrapper  .hosted-input {
	border-top: solid 1px #DEE2E5 !important;
	border-bottom: solid 1px #DEE2E5 !important;
	padding: 12px 14px;
}

#loading, .loading-mask {
	top: 0;
	left: 0;
	position: fixed;
	width: 100%;
	height: 100%;
}

.loading-mask {
	position: absolute;
	background-color: #fff;
	opacity: 0.6;
}

.cssload-container {
	z-index: 1;
	background-image: url('/assets/img/ring-alt.gif');
	background-repeat: no-repeat;
	background-position: center;
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0;
	left: 0;
}

.extra-options-wrapper {
	padding-top: 5px;
	display: block;
}

.extra-option-toggle {
	display: block;
}

.extra-options-wrapper .extra-option-toggle::BEFORE {
	content: "\2193";
}

.extra-options-wrapper .extra-options {
	display: none;
}

.extra-options-wrapper.on .extra-option-toggle::BEFORE {
	content: "\2191";
}

.extra-options {
	padding: 10px;
	background-color: ivory;
	border: 1px solid #EEE;
	border-radius: 5px;
}

.extra-options-items, .extra-options-items label, .extra-options-items input, .extra-options-items div,
	.customer-payment-methods input, .customer-payment-methods label {
	display: inline-block;
	width: auto;
	margin: 0;
	border: none;
	padding: 0;
}

.extra-options-items {
	width: 100%;
}

.extra-options-items input[type="button"] {
	padding: 10px;
	margin: 5px;
}

.extra-options-buttons-wrapper {
	text-align: center;
	width: 100% !important;
}

.extra-options-items input[type="text"], .extra-options-items input[type="tel"] {
	margin: 5px !important;
	background-color: white !important;
	border: 1px solid #ccc !important;
	padding: 5px !important;
}

.customer-payment-methods label:hover, .customer-payment-methods label:focus, .customer-payment-methods label:active {
	color: #5CD493;
	border-color: #5CD493;
}

input:DISABLED {
	opacity: 0.5;
}

.customer-id-option {
	display: none;
}

.notice-wrapper {
	overflow: auto;
}

header.main {
	z-index: 10000;
}

.customer-payment-methods li {
	height: 40px;
	padding: 8px;
	border-top: 1px;
	border-bottom: 1px;
}

.payment-section {
	padding-top: 0 !important;
}

.payment-method input {
	margin-left: 50px;
}

.payment-method-type {
	font-weight: bold;
}

.payment-method label {
	margin-left: 0.5em;
}

.payment-method input {
	margin-top: auto;
	margin-bottom: auto;
}

.payment-method-description {
	margin-left: 0.5em;
	opacity: 0.5;
}

.payment-method-icon {
	background-image: url('https://assets.braintreegateway.com/dropin/2.27.0/images/braintree_dropin_sprite.png');
	width: 44px;
	height: 29px;
	background-repeat: no-repeat;
	border: 1px solid transparent;
	position: absolute;
	background-position: 0 -171px;
	margin-top: -5px;
}

.jcb {
	background-position: 0px -143px;
}

.maestro {
	background-position: 0 -227px;
}

.mastercard {
	background-position: 0px -255px;
}

.amex {
	background-position: 0px -311px;
}

.dinersclub {
	background-position: 0 -367px;
}

.discover {
	background-position: 0px -395px;
}

.visa {
	background-position: 0px -423px;
}

.paypal {
	background-position: 0px -452px;
}

.card-theme-option {
	display: block !important;
}
</style>
</head>
