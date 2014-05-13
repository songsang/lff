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

    //获取产品分类的文件路径
    protected function GetFilepathCategory()
    {
        $tmpLoc = $this->getLoc('_data/_cache');
        $filecategroy = $this->getUserConfig('filecategroy');
        $filecategroy = $filecategroy ? $$filecategroy : 'goods-category.dat';
        $fileCate = $tmpLoc.'/'.$filecategroy;
        return $fileCate;
    }
    //获取产品分类的内容(json)
    protected function GetContentCategory()
    {
        $fileCate = $this->GetFilepathCategory();
        if(is_file($fileCate)){
            return json_decode(file_get_contents($fileCate), true);
        }
        return false;
    }
    
};
