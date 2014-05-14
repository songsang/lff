<?php
/**
 * desc: 主·配置文件
 *
 *
 *
 *
 *
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
define('PROJECTLOC',        realpath(dirname(__FILE__).DIRECTORY_SEPARATOR.'..'));//工程目录
//=========================主·公共常量==================================end//


//=========================主.公共变量=====================================//
$sessionid          = 'primary'; // md5($CLIENTHOST.$BROWSERID.'primary');
$INCLUDE_DIRS_MAIN  = array(
    PROJECTLOC.'/extends',
    PROJECTLOC.'/common',
);
//=========================主·公共变量==================================end//


//=========================主·常用设置=====================================//
// echo ini_get('session.cookie_domain');
ini_set('session.cookie_domain', COOKIE_DOMAIN);
//=========================主.常用设置==================================end//



//===========================加载自动加载==================================//
require_once(PROJECTLOC.'/../LffFramework/AutoLoad.php');
// CAutoLoad::AutoLoad($includedirs);
//==========================加载自动加载================================end//


return array(
    'home'         => 'http://'.HTTPHOST,
    'mainDomain'   => 'http://'.HTTPHOST, // http://www.aaa.me
    'uploadDomain' => 'http://'.HTTPHOST, // http://up.aaa.me
    'imageDomain'  => 'http://'.HTTPHOST, // http://img.aaa.me
    'assetDomain'  => 'http://'.HTTPHOST, // http://assets.aaa.me
    
    'projectLoc'   => PROJECTLOC,

    'name'=>'测试',
    'sessionid' => $sessionid,
    'cookiedomain' => COOKIE_DOMAIN,
    'topdomain' => TOP_DOMAIN,
    'URLMODE' => 2,
    
    // application-level parameters that can be accessed

    'ERROR_NO_MODCLASS' => '', //没有找到模型类
    'ERROR_NO_CTLCLASS' => '', //没有找到控制器类
    'ERROR_NO_MODEFILE' => '', //没有找到模型文件
    'ERROR_NO_CTRLFILE' => '', //没有找到控制器文件
    'ERROR_NO_VIEWFILE' => '', //没有找到视图文件
    'params'=>array(    'var1'=>1,
                        'var2'=>2,
                    ),
    
    'user' => array(
    ),
    'dsArr' => array(
        'master' => array(
            array(
                'host'=>'192.168.1.211',
                'user'=>'root',
                'pswd'=>'root',
                'dbName'=>'test',
                'alias'=>'test'
                ),
        ),
    ),
);
