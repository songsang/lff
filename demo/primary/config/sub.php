<?php

$projectLoc = realpath(dirname(__FILE__).'/../..');

$configGlobalArr = require_once($projectLoc.'/config/main.php');

$configSubArr = array(
    'subApp' => 'primary',
    'ui' => 'blue',
    
    'nickmethods' => array(
    ),
    'routeAlias' => array(
        
    ),
    
    'user' => array(
        'key' => 'value',
    ),
);

return array_merge_recursive($configGlobalArr, $configSubArr);
