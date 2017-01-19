<?php
require_once ("../includes/braintree_init.php");
require_once ("../includes/braintree_utils.php");
require_once ("../includes/ajax.php");

?>

<html>
<?php require_once("../includes/head.php"); ?>
<body>

    <?php
    require_once ("../includes/header.php");
    
    $customer_id = isset($_SESSION['customerId']) ? $_SESSION['customerId'] : '';
    
    $customer_id = isset($_REQUEST['customerId']) ? $_REQUEST['customerId'] : $customer_id;
    
    $vault_option = isset($_REQUEST['vault_option']) ? $_REQUEST['vault_option'] : '';
    
    ?>
<script>
var vault_option='<?php echo $vault_option;?>';
var ajaxurl='/';
</script>
	<div class="wrapper">
		<div class="checkout container">

			<header>
				<h1>
					Hi, <br>Let's test a transaction
				</h1>
				<p>Make a test payment with Braintree using PayPal or a card</p>
			</header>
			<div class="ui-options">
				<select id="ui_selector">
					<option value="drop-in-ui">Drop-in UI</option>
					<option value="custom-ui" selected="selected">Custom UI</option>
					<option value="hosted-ui">Hosted Fields UI</option>
					<option value="paypal-button">PayPal button</option>
				</select> <select id="threeDS_option">
					<option value="true" selected="selected">3DS mandatory</option>
					<option value="optional">3DS optional</option>
					<option value="false">3DS disabled</option>
				</select> <select id="avs_option">
					<option value="true" selected="selected">Relay on AVS if non-3DS card</option>
					<option value="false">Relay on 3DS only</option>
				</select>

			</div>
			<form method="post" id="payment-form" action="/checkout.php">
				<div class="extra-options-wrapper off">
					<a href="#extra_options" class="extra-option-toggle">Show advanced options</a>
					<div class="extra-options">
						<div class="extra-options-items">
							<fieldset>
								<legend>Vault options:</legend>
								<select id="vault_option" name="vault_option">
									<option value="">Do not store the Customer in Vault</option>
									<option value="storeInVaultOnSuccess">Store Customer in Vault on success</option>
									<option value="storeInVault">Always store the Customer in Vault</option>
								</select>
								<div class="customer-id-option">
									<label for="customerId">Customer Id :</label><input type="tel" id="customerId" name="customerId" min="1"
										value="<?php echo $customer_id;?>" placeholder="enter Id"
										title="Enter an existent or new Id that will be used to create the new customer">
								</div>
							</fieldset>
							<fieldset class="card-theme-option">
								<legend>Look & feel options:</legend>
								<label for="theme_options">Select the card theme :</label> <select id="theme_options">
								</select>
							</fieldset>
							<fieldset class="paypal-options">
								<legend>PayPal button options:</legend>
								<select id="paypal-flow">
									<option value="checkout" selected="selected">PayPal Checkout flow</option>
									<option value="vault">PayPal Vault flow</option>
								</select> <select id="paypal-intent">
									<option value="sale" selected="selected">Submit for settlement</option>
									<option value="authorize">Authorize only</option>
								</select> <select id="paypal-useraction">
									<option value="" selected="selected">Continue</option>
									<option value="commit">Pay Now</option>
								</select>
								<div>
									<label for="paypal-displayName">Display name</label> <input id="paypal-displayName" type="text"
										placeholder="enter name">
								</div>
								<div>
									<label for="paypal-locale">Locale</label><input id="paypal-locale" type="text" placeholder="locale code"
										value="en_US">
								</div>
								<select id="paypal-enableShippingAddress">
									<option value="false">Shipping address disabled</option>
									<option value="true">Enable shipping address</option>
								</select> <select id="paypal-shippingAddressEditable">
									<option value="false">ROnly shipping address</option>
									<option value="true">Editable shipping address</option>
								</select>
								<div>
									<label for="paypal-billingAgreementDescription">Billing agreement description</label><input
										id="paypal-billingAgreementDescription" type="text" placeholder="enter description">
								</div>
								<select id="paypal-offerCredit">
									<option value="false" selected="selected">No credit</option>
									<option value="true">PayPal credit</option>
								</select>
								<div>
									<label>Button options:</label> <select id="paypal-button-color">
										<option value="blue">Blue</option>
										<option value="gold" selected="selected">Gold</option>
										<option value="silver">Silver</option>
									</select> <select id="paypal-button-size">
										<option value="large">Large</option>
										<option value="medium" selected="selected">Medium</option>
										<option value="small">Small</option>
										<option value="tiny">Tiny</option>
									</select> <select id="paypal-button-shape">
										<option value="pill">Pill</option>
										<option value="rect">Rect</option>
									</select> <select id="paypal-button_type">
										<option value="button" selected="selected">Button</option>
										<option value="submit">Submit</option>
										<option value="none">None</option>
									</select> </select> <select id="paypal-button-tagline">
										<option value="true">With tagline</option>
										<option value="false" selected="selected">No tagline</option>
									</select>
									<div>
										<label for="paypal-button-label">Button label</label><input id="paypal-button-label" type="text"
											placeholder="enter label"> <span>&lt;= Use {wordmark} tag for logo</span>
									</div>
								</div>
							</fieldset>
							<div class="extra-options-buttons-wrapper">
								<input id="apply-options" class="button" type="button" value="Apply changes">
							</div>
						</div>
					</div>
				</div>

				<section class="payment-section">
					<div class="customer-payment-methods-wrapper"></div>
					<div class="card-wrapper"></div>
					<label for="amount"> <span class="input-label">Amount</span>
						<div class="input-wrapper amount-wrapper">
							<input id="amount" name="amount" type="tel" min="1" max="10" placeholder="Amount" value="10">
						</div>
					</label> <label for="street_address"> <span class="input-label">Street address</span>
						<div class="input-wrapper street-address-wrapper">
							<input id="street_address" name="street_address" type="text" placeholder="Street address">
						</div>
					</label>
				</section>

				<button class="button" type="submit">
					<span>Test Transaction</span>
				</button>
			</form>
		</div>
	</div>

<?php include_once '../includes/footer.php';?>	

</body>
</html>
