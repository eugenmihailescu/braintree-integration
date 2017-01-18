<?php
// production only
header('Cache-Control: no-cache, no-store, must-revalidate');

$known_actions = array(
    'get_token' => array(
        'customerId'
    ),
    'get_payment_methods' => array(
        'customerId',
        'filterByMethod'
    ),
    'get_card' => array(
        'theme_id',
        'ui_type'
    ),
    'get_theme_list' => array(
        'ui_type'
    )
);

if (isset($_POST['action']) && isset($_SERVER['HTTP_X_WHOIAM']) && 'BraintreeApp' == $_SERVER['HTTP_X_WHOIAM']) {
    header('HTTP/1.1 200 OK');
    header('Content-type:application/json;charset=utf-8');
    
    $action = $_POST['action'];
    
    try {
        if (! array_key_exists($action, $known_actions))
            throw new Exception(sprintf('Unknown Ajax action: %s', $action));
        
        $arguments = array();
        
        foreach ((array) $known_actions[$action] as $param_name)
            $arguments[] = isset($_POST[$param_name]) ? $_POST[$param_name] : null;
        
        $response = call_user_func_array($_POST['action'], $arguments);
        
        is_array($response) || $response = array(
            'data' => $response
        );
        $response['success'] = true;
    } catch (Exception $e) {
        $response = array(
            'error' => array(
                'message' => $e->getMessage()
            )
        );
    }
    
    echo json_encode($response, JSON_FORCE_OBJECT);
    
    die();
}

/**
 * Retrieves the PHP session customer Id if any, the default $id otherwise
 *
 * @param string $id
 *            A default customer Id if none is found on current PHP session
 * @return string Returns the customer Id
 */
function get_customer_id($id)
{
    $customer_id = isset($_SESSION['customerId']) ? $_SESSION['customerId'] : '';
    
    return isset($id) ? $id : $customer_id;
}

/**
 * Generates a new Braintree's client token.
 * If the customer $id is specified then generates a customer specific token.
 *
 * @param string $id
 *            The Id of the Braintree's Vault stored customer if specified, null otherwise
 */
function get_token($id = null)
{
    $customer_id = get_customer_id($id);
    
    $args = array();
    
    try {
        if (! empty($customer_id)) {
            if ($customer = getCustomerById($customer_id)) {
                $args['customerId'] = $customer->id;
            }
        }
    } catch (Exception $e) {}
    
    $token = Braintree\ClientToken::generate($args);
    
    return array(
        'token' => $token
    );
}

/**
 * Get the html fragment that represent the Vault store payment methods for a given customer $id
 *
 * @param string $id
 *            The customer Id stored in the Braintree's Vault
 * @param string|boolean $filterByMethod
 *            When specified then filter the methods by the specified string, otherwise return all
 * @return array Returns the html fragment within an array
 */
function get_payment_methods($id = null, $filterByMethod = "")
{
    $customer_id = get_customer_id($id);
    
    ob_start();
    if (! empty($customer_id)) {
        if ($customer = getCustomerById($customer_id)) {
            $customer_payment_methods = getCustomerPaymentMethods($customer);
            
            $payments_methods = parseCustomerPaymentMethods($customer_payment_methods, $filterByMethod);
            
            $top = 5;
            // sort the array DESC by payment method expiry date
            uasort($payments_methods, function ($a, $b) {
                return $b['expiry'] - $a['expiry'];
            });
            $payments_methods = array_slice($payments_methods, 0, $top);
            
            empty($payments_methods) || include_once 'assets/templates/payment-methods.php';
        }
    }
    
    return array(
        'html' => ob_get_clean()
    );
}

/**
 * Get the html,css and javascript fragments specific to a UI integration and theme that allows to build-up a card widget
 *
 * @param string $theme_id
 *            The theme id that is the base name of the theme directory
 * @param string $ui_type
 *            The UI integration type coresponding to the fetched card
 * @throws Exception Throws an exception if the card's theme is not found
 * @return array Returns an array of html,css and javascript fragments
 */
function get_card($theme_id, $ui_type)
{
    $get_file_url = function ($filename) {
        return str_replace(DIRECTORY_SEPARATOR, '/', str_replace(dirname(__DIR__) . '/public_html', '', $filename));
    };
    
    $get_conf_items = function ($array) {
        $result = array();
        foreach ($array as $filename)
            $result = array_merge($result, file($filename));
        
        return $result;
    };
    
    $templates_path = 'assets/templates/';
    $theme_path = $templates_path . 'themes/';
    $theme_name = $ui_type . '.php';
    
    $theme_file = false;
    
    if (is_file($theme_path . $theme_id . '/' . $theme_name)) {
        $theme_file = $theme_path . $theme_id . '/' . $theme_name;
        
        $theme_css_deps = array_merge(glob($theme_path . $theme_id . '/' . $ui_type . '.css'), $get_conf_items(glob($theme_path . $theme_id . '/' . $ui_type . '.css.conf')));
        $theme_js_deps = array_merge(glob($theme_path . $theme_id . '/' . $ui_type . '.js'), $get_conf_items(glob($theme_path . $theme_id . '/' . $ui_type . '.js.conf')));
    } elseif (is_file($templates_path . $theme_name)) {
        $theme_file = $templates_path . $theme_name;
        
        $theme_css_deps = array_merge(glob($templates_path . '/' . $ui_type . '.css'), $get_conf_items(glob($templates_path . '/' . $ui_type . '.css.conf')));
        $theme_js_deps = array_merge(glob($templates_path . '/' . $ui_type . '.js'), $get_conf_items(glob($templates_path . '/' . $ui_type . '.js.conf')));
    }
    
    if ($theme_file) {
        
        ob_start();
        
        include_once ($theme_file);
        
        return array(
            'html' => ob_get_clean(),
            'css' => array_map($get_file_url, $theme_css_deps),
            'js' => array_map($get_file_url, $theme_js_deps)
        );
    }
    throw new Exception(sprintf('Theme %s not found', $theme_id));
}

/**
 * Builds a list of themes for a specific UI integration from theme's directory
 *
 * @param string $ui_type
 *            The UI integration type
 * @return array Returns an array of themes names
 */
function get_theme_list($ui_type)
{
    $dirs = array(
        '' => 'Default'
    );
    
    foreach (array_filter(glob('assets/templates/themes/*', GLOB_ONLYDIR | GLOB_MARK), function ($item) use (&$ui_type) {
        return is_file($item . $ui_type . '.php');
    }) as $value)
        $dirs[basename($value)] = ucfirst(basename($value));
    
    return array(
        'themes' => $dirs
    );
}
