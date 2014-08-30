<?php
/**
 * desc: 主·配置文件
 *
 *
*/

//=========================主.公共常量=====================================//
define('HTTPHOST',          $_SERVER['HTTP_HOST']);
define('ROOT',              $_SERVER['DOCUMENT_ROOT']);
define('CLIENTHOST',        $_SERVER['REMOTE_ADDR']);
define('BROWSERID',         $_SERVER['REMOTE_ADDR']);
define('TOP_DOMAIN',        substr(HTTPHOST,strpos(HTTPHOST,'.')));//www.abc.com -> .abc.com
define('COOKIE_DOMAIN',     TOP_DOMAIN);//默认的cookie domain
define('BOOT',              realpath(dirname(__FILE__).DIRECTORY_SEPARATOR.'..'));//工程目录
//=========================主·公共常量==================================end//

//=========================主.公共变量=====================================//
$INCLUDE_DIRS_MAIN  = array(
    BOOT.'/extends',
    BOOT.'/common',
    BOOT.'/plugin/third/userAgent',
);
//=========================主·公共变量==================================end//

//=========================主·常用设置=====================================//
$session_id = 'primary'; // md5($CLIENTHOST.$BROWSERID.'primary');
$session_domain = TOP_DOMAIN;
ini_set('session.cookie_domain', COOKIE_DOMAIN);
//=========================主.常用设置==================================end//

//===========================加载自动加载==================================//
require_once(BOOT.'/../LffFramework/AutoLoad.php');
// CAutoLoad::AutoLoad($includedirs);
//==========================加载自动加载================================end//

return array(
    'home'         => 'http://'.HTTPHOST,
    'HOME'         => 'http://'.HTTPHOST,
    'HOME_WWW'     => 'http://www'.TOP_DOMAIN,     // http://www.aaa.me
    'HOME_IMG'     => 'http://img'.TOP_DOMAIN,     // http://img.aaa.me
    'HOME_SPE'     => 'http://spe'.TOP_DOMAIN,     // http://spe.aaa.me
    'HOME_ITEM'    => 'http://item'.TOP_DOMAIN,    // http://item.aaa.me
    'HOME_SEARCH'  => 'http://search'.TOP_DOMAIN,  // http://search.aaa.me
    'HOME_CLUB'    => 'http://club'.TOP_DOMAIN,    // http://search.aaa.me
    
    'projectLoc'   => BOOT,
    'boot'   => BOOT,
    
    'name'=>'测试',

    'tt' => 1,
    'cookiedomain' => COOKIE_DOMAIN,
    'topdomain' => TOP_DOMAIN,
    'URLMODE' => 2,
    
    // application-level parameters that can be accessed
    'params'=>array(    'var1'=>1,
                        'var2'=>2,
                    ),
    
    'user' => array(
    ),
    'dsArr' => array(
        'master' => array(
            array(
                'host'=>'127.0.0.1',
                'user'=>'root',
                'pswd'=>'root',
                'dbName'=>'test',
                'alias'=>'test'
                ),
        ),
    ),
);
