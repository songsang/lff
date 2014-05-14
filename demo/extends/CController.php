<?php
class CController extends CCtrl {

    protected $isClean = false;
    function __construct(){

    }

    protected function writeWebLog($logs, $prex)
    {
        $time = date("Y-m-d.H:i:s");
        $logs = ">>>>>{$time}\n".$logs."\n{$time}<<<<<\n";
        $this->writeLog($logs, "a", '/tmp', '', $prex);
    }

    protected function method($def='POST')
    {
        $def = strtoupper($def);
        return isset($_SERVER['REQUEST_METHOD'])?$_SERVER['REQUEST_METHOD']:$def;
    }
    protected function ip()
    {
        return isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'';
    }
    protected function isPost()
    {
        return 'POST'==$this->method()?true:false;
    }
    protected function getRef()
    {
        return isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:null;
    }
    protected function jump($url)
    {
        ob_clean();
        header("Location: {$url}");
        exit;
    }
    protected function output($var, $format='json', $isexit=true, $iscleanbuff=true)
    {
        if($iscleanbuff)ob_clean();
        echo json_encode($var);
        if($isexit)exit(0);
    }   
};
