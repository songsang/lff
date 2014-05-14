<?php

$HTTPHOST   = $_SERVER['HTTP_HOST'];
$ROOT       = $_SERVER['DOCUMENT_ROOT'];
$CLIENTHOST = $_SERVER['REMOTE_ADDR']; //客户端地址
$BROWSERID  = $_SERVER['REMOTE_ADDR']; //浏览器again
$TOP_DOMAIN = substr($HTTPHOST,strpos($HTTPHOST,'.')); //顶级域名 //www.abc.com -> .abc.com

$COOKIE_DOMAIN = $TOP_DOMAIN; //默认的cookie domain
ini_set('session.cookie_domain', $COOKIE_DOMAIN);

// echo ini_get('session.cookie_domain');
 
$sessionid = 'primary'; // md5($CLIENTHOST.$BROWSERID.'primary');

$PROJECTLOC  = realpath(dirname(__FILE__).DIRECTORY_SEPARATOR.'..');
$includedirs = array(
        $PROJECTLOC.'/dao',
        $PROJECTLOC.'/extends',
        $PROJECTLOC.'/common',
        $PROJECTLOC.'/plugin/third/alipay',
        $PROJECTLOC.'/plugin/third/PHPExcel',
    );
require_once($PROJECTLOC.'/../LffFramework/AutoLoad.php');
CAutoLoad::AutoLoad($includedirs);

return array(
    'home'         => 'http://'.$HTTPHOST,
    'mainDomain'   => 'http://'.$HTTPHOST, // http://www.aaa.me
    'uploadDomain' => 'http://'.$HTTPHOST, // http://up.aaa.me
    'imageDomain'  => 'http://'.$HTTPHOST, // http://img.aaa.me
    'assetDomain'  => 'http://'.$HTTPHOST, // http://assets.aaa.me
    
    'projectLoc'   => $PROJECTLOC,

    'name'=>'测试',
    'sessionid' => $sessionid,
    'cookiedomain' => $COOKIE_DOMAIN,
    'topdomain' => $TOP_DOMAIN,
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
        'mail' => 'heqmro@126.com',
        'mailpass' => 'heqmro12345678',
        'filecategory' => 'goods-category.dat',
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
