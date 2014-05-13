<?php
/**
* author: cty@20131101
*   desc: 写日志 
*   
*/

class CLog {

    static $dir = "/tmp";
    static function WriteLog($logs, $filename, $mod="a")
    {
        $dir = self::$dir;
        $fpfile = $dir.'/'.$filename.'.'.date("Ymd").'.log';
        $fp = fopen($fpfile, $mod);
        if(!$fp)return false;

        $time = date("Y-m-d.H:i:s");
        ob_start();
        echo ">>>>>>>>>>{$time}\n";
        print_r($logs);
        echo "\n";
        echo "<<<<<<<<<<{$time}\n";
        echo "\n";
        $logconent = ob_get_clean();

        fputs($fp, $logconent);
        fclose($fp);
    }
};
