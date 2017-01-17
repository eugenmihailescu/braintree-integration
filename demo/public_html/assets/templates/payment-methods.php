<ul class="customer-payment-methods">
<?php
$id = 1;
foreach ($payments_methods as $data) {
    $pid = 'cpm_' . $id;
    printf('<li class="payment-method"><span class="payment-method-icon stick-left %s"></span><input type="radio" id="%s" name="payment_method_token" value="%s">', $data['css_class'], $pid, $data['token']);
    printf('<label class="payment-method-type" for="%s">%s</label><span class="payment-method-description">(%s)</span></li>', $pid, $data['type'], 'CreditCard' == $data['method'] ? $data['maskedNumber'] : $data['email']);
    $id ++;
}
?>
<li class="payment-method new-payment-method"><input type="radio" name="payment_method_token" id="new_payment_method" value=""
		checked="checked"><label for="new_payment_method">Add new payment method</label></li>
</ul>
