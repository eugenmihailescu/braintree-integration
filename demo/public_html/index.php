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
							<div class="card-theme-option">
								<label for="theme_options">Select the card theme :</label> <select id="theme_options">
								</select>
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
