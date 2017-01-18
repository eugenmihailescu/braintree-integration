<?php

/**
 * Get the Braintree customer object by customer Id
 * 
 * @param string $customer_id The customer Id as stored in the Braintree Vault
 * @return boolean Returns the Braintree_Customer object on success, false otherwise
 */
function getCustomerById($customer_id)
{
    return Braintree_Customer::find($customer_id);
}

/**
 * Get the customer Vault stored payment methods
 *
 * @param int|Braintree_Customer $customer
 *            A customer Id or object to search
 * @return array Returns the array of payment methods stored into Braintre Vault for the given customer
 */
function getCustomerPaymentMethods($customer)
{
    $result = array();
    
    if (is_a($customer, 'Braintree_Customer') || ($customer = getCustomerById($customer))) {
        $result = $customer->paymentMethods;
    }
    
    return $result;
}

/**
 * Returns a short name for a credit card type
 *
 * @param string $name
 *            The card type name
 * @return mixed Returns the card's short name
 */
function getCreditCardTypeByName($name)
{
    $card_types = array(
        'amex' => 'American Express',
        'carteblanche' => 'Carte Blanche',
        'unionpay' => 'China UnionPay',
        'dinersclub' => 'Diners Club',
        'discover' => 'Discover',
        'jcb' => 'JCB',
        'laser' => 'Laser',
        'maestro' => 'Maestro',
        'mastercard' => 'MasterCard',
        'solo' => 'Solo',
        'switch' => 'Switch',
        'visa' => 'Visa',
        '' => 'Unknown'
    );
    
    return array_search($name, $card_types);
}

/**
 * Rotate the bits of a byte to left|right by a number of times
 *
 * @param byte $octet
 *            The byte number
 * @param number $shift
 *            The number of times to rotate the byte. A positive will rotate to left, a negative will rotate backwards to the right.
 * @return byte Returns the rotate byte number
 */
function byte_rotate_bits($octet, $shift)
{
    $shiftRight = function ($octet, $shift) {
        return ($octet >> $shift) | ($octet << (8 - $shift));
    };
    
    $shiftLeft = function ($octet, $shift) {
        return ($octet << $shift) | ($octet >> (8 - $shift));
    };
    
    return $shift > 0 ? $shiftLeft($octet, $shift) : $shiftRight($octet, - $shift);
}

/**
 * Encodes base64 a string by arbitrary bitwise rotation
 *
 * @param string $key
 *            The string to encode
 * @return string The bitwise rotated and base64 encoded string.
 *         The first 3 bytes contains the number of shift operations used for rotation.
 */
function bt_encode_key($key)
{
    // rotate using an arbitrary number of bits
    $bits = rand(1, strlen($key) - 1);
    
    $rotated_key = '';
    for ($i = 0; $i < strlen($key); $i ++) {
        $rotated_key .= chr(byte_rotate_bits(ord($key[$i]), $bits));
    }
    
    // enclose the rotation info within the result (required at decoding)
    $prefix = str_pad($bits, 3, '0', STR_PAD_LEFT);
    
    return base64_encode($prefix . $rotated_key);
}

/**
 * Decodes a base64 encoded string given in a bitwise rotated format.
 * The first 3 bytes contains the number of shift operations used for rotation.
 *
 * @param string $encoded_key
 *            The bitwise rotated and base64 encoded input string
 * @return boolean|string Returns the decoded string on success, false otherwise
 */
function bt_decode_key($encoded_key)
{
    if (! ($rotated_key = base64_decode($encoded_key, true)))
        return false;
        
        // extract rotation info from the input key
    $bits = ltrim(substr($rotated_key, 0, 3), '0');
    $bits = - intval($bits);
    
    $rotated_key = substr($rotated_key, 3);
    
    $key = '';
    for ($i = 0; $i < strlen($rotated_key); $i ++)
        $key .= chr(byte_rotate_bits(ord($rotated_key[$i]), $bits));
    
    return $key;
}

/**
 * Parses the customer payment methods and returns a formatted array containing only UI-dependent info
 *
 * @param array $customer_payment_methods
 *            An array of Braintree Vault-stored customer payment methods
 * @param string|boolean $filterByMethod
 *            When specified then filter the methods by the specified string, otherwise return all
 * @return array
 */
function parseCustomerPaymentMethods($customer_payment_methods, $filterByMethod = false)
{
    $payments_methods = array();
    
    foreach ($customer_payment_methods as $bt_payment_method) {
        $is_card = is_a($bt_payment_method, 'Braintree\CreditCard');
        $is_paypal = is_a($bt_payment_method, 'Braintree\PayPalAccount');
        $method = $is_card ? 'CreditCard' : 'PayPalAccount';
        
        if ($filterByMethod && $filterByMethod !== $method)
            continue;
        
        $token = bt_encode_key($bt_payment_method->token);
        
        if (($is_card && ! $bt_payment_method->expired) || $is_paypal) {
            $uid = $is_card ? $bt_payment_method->uniqueNumberIdentifier : '';
            $email = $is_card ? '' : $bt_payment_method->email;
            $key = $uid . $email;
            
            // in case of multiple tokens for the same payment method (card,PayPal) make sure we only show the last token used
            if (array_key_exists($key, $payments_methods)) {
                if ($interval = $payments_methods[$key]['updatedAt']->diff($bt_payment_method->updatedAt))
                    if (intval(1000000 * floatval($interval->format('%R%a.%h%i%s'))) < 0)
                        continue;
            }
            
            // add|overwrite the payment method
            $payments_methods[$key] = array(
                'type' => $is_card ? $bt_payment_method->cardType : 'PayPal',
                'css_class' => $is_card ? getCreditCardTypeByName($bt_payment_method->cardType) : 'paypal',
                'method' => $method,
                'default' => $bt_payment_method->default,
                'maskedNumber' => $is_card ? $bt_payment_method->maskedNumber : false,
                'expiry' => $is_card ? $bt_payment_method->expirationYear . $bt_payment_method->expirationMonth : false,
                'token' => $token,
                'email' => $email,
                'uid' => $uid,
                'updatedAt' => $bt_payment_method->updatedAt
            );
        }
    }
    
    return $payments_methods;
}

