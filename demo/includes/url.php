<?php
if (! (empty($_ENV['SHELL']) && empty($_SERVER['argv'])) && empty($_SERVER["REMOTE_ADDR"])) {
    $_SELF_URL = realpath($argv[0]);
} else {
    $server = $_SERVER['SERVER_NAME'];
    
    if (substr($server, - 1) == '/') {
        $server = substr($server, 0, - 1);
    }
    
    $protocol = (isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] == 'https') || (isset($_SERVER['HTTPS']) && (strtolower($_SERVER['HTTPS']) == 'on' || $_SERVER['HTTPS'] == '1')) ? 'https' : 'http';
    
    $port = ($_SERVER['SERVER_PORT'] == '80') ? '' : (':' . $_SERVER['SERVER_PORT']);
    
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
    
    $_SELF_URL = sprintf('%s://%s%s/%s', $protocol, $server, $port, ! empty($uri) && '/' == $uri[0] ? substr($uri, 1, strlen($uri) - 1) : $uri);
}