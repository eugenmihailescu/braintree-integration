<?php
$sdk2_version = '2.27.0';
$sdk3_version = '3.8.0';
$app_js_path = 'assets/js/app/';
$optimization = ".min"; // ".min",""
?>
<div id="loading" class="hidden">
	<div class="cssload-container"></div>
	<div class="loading-mask"></div>
</div>

<?php include_once 'assets/templates/3dsframe.php';?>

<script>
var client_sdk={"sdk2":"<?php echo $sdk2_version?>","sdk3":"<?php echo $sdk3_version?>","sufix":"<?php echo $optimization;?>"};
</script>
<!-- SDK v2 -->
<script src="https://js.braintreegateway.com/js/braintree-<?php echo $sdk2_version;?>.js"></script>

<!-- SDK v3 -->
<script src="https://js.braintreegateway.com/web/<?php echo $sdk3_version;?>/js/client<?php echo $optimization;?>.js"></script>
<script src="https://js.braintreegateway.com/web/<?php echo $sdk3_version;?>/js/three-d-secure<?php echo $optimization;?>.js"></script>
<script src="https://js.braintreegateway.com/web/<?php echo $sdk3_version;?>/js/hosted-fields<?php echo $optimization;?>.js"></script>
<script src="https://js.braintreegateway.com/web/<?php echo $sdk3_version;?>/js/paypal<?php echo $optimization;?>.js"></script>
<script src="https://js.braintreegateway.com/web/<?php echo $sdk3_version;?>/js/data-collector<?php echo $optimization;?>.js"></script>

<!-- our UI JS classes -->
<script src="assets/js/integration/InputMask.js"></script>
<script src="assets/js/integration/BraintreeUtils.js"></script>
<script src="assets/js/integration/ConfiguredClass.js"></script>
<script src="assets/js/integration/BraintreeClient3.js"></script>
<script src="assets/js/integration/ThreeDSecure.js"></script>
<script src="assets/js/integration/GenericIntegration.js"></script>
<script src="assets/js/integration/BraintreeUI3.js"></script>
<script src="assets/js/integration/DropinUI.js"></script>
<script src="assets/js/integration/CustomUI.js"></script>
<script src="assets/js/integration/HostedFieldsUI.js"></script>
<script src="assets/js/integration/PayPalButton.js"></script>
<script src="assets/js/integration/PayPalButtonUI.js"></script>
<script src="assets/js/app/main.js"></script>
<?php
foreach (glob($app_js_path . '*.js') as $js_file)
    if (basename($js_file) != 'main.js') {
        echo '<script src="' . $app_js_path . basename($js_file) . '"></script>', PHP_EOL;
    }
?>
<script type="text/javascript">
<?php
$env_filename = __DIR__ . '/../.env';
if (preg_match('/=YOUR_(MERCHANT|PUBLIC|PRIVATE)_(ID|KEY)/', file_get_contents($env_filename))) {
    $msg = "You have not configured your Braintree keys in the " . realpath($env_filename);
    ?>
 $(".notice-wrapper").html(
                "<div class=\"show notice error notice-error\"><span class=\"notice-message\"><?php echo $msg;?></span></div>");
        BraintreeApp.prototype.checkout.notify("error");
        document.querySelector("button[type=submit]").style.display="none";
<?php
} else {
    ?>
new BraintreeApp();
<?php
}
?>
</script>
