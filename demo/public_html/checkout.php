<?php
require_once ("../includes/braintree_init.php");
require_once ("../includes/braintree_utils.php");

$customerId = $_POST["customerId"];
$vault_option = $_POST['vault_option'];

$amount = $_POST["amount"];

$nonce = isset($_POST["payment_method_nonce"]) ? $_POST["payment_method_nonce"] : false;
$encoded_token = isset($_POST['payment_method_token']) ? $_POST['payment_method_token'] : false;
$token = empty($encoded_token) ? false : bt_decode_key($encoded_token);

$_SESSION['customerId'] = $customerId;

$args = array(
    'amount' => $amount,
    'options' => array(
        'submitForSettlement' => true
    )
);

if (! ($token || empty($vault_option))) {
    $args['options'][$vault_option] = true;
    $args['customer'] = array(
        'id' => $customerId
    );
}

if (! empty($token))
    $args['paymentMethodToken'] = $token;
elseif (! empty($nonce))
    $args['paymentMethodNonce'] = $nonce;

$result = Braintree\Transaction::sale($args);

if ($result->success || ! is_null($result->transaction)) {
    $transaction = $result->transaction;
    header("Location: transaction.php?id=" . $transaction->id);
} else {
    $errorString = "";
    
    foreach ($result->errors->deepAll() as $error) {
        $errorString .= 'Error: ' . $error->code . ": " . $error->message . "\n";
    }
    
    $_SESSION["errors"] = $errorString;
    header("Location: " . preg_replace("/\/[^.\/]+\.php$/", "", $_SERVER["REQUEST_URI"]) . "/index.php");
}
