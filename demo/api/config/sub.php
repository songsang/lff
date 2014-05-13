<?php

$projectLoc = realpath(dirname(__FILE__).'/../..');

$configGlobalArr = require_once($projectLoc.'/config/main.php');

$configSubArr = array(
    'subApp' => 'api',
    'routeAlias' => array(
        
    ),
);

return array_merge_recursive($configGlobalArr, $configSubArr);
