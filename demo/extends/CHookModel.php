<?php
/**
 * author: cty@20121128
 *   desc: 1, 此类的主要目的是解决在自定义的模型中用$this去调用框架的任意方法,
 *            从而实现可以将控制器的方法平滑地移动到模型中去。
 *         2, 当然也可以做一些公共扩展;
 *         3, 此类并不是必须的，但推荐使用;
 *         4, 如果你不需要此类那你可以在你的模型文件中直接继续CModel;
 *
 *
*/
class CHookModel extends CModel {

    protected function writeSql($sqls)
    {
        $sqls = str_replace(';', ";\n", $sqls);

        $time = date("Y-m-d.H:i:s");
        $logs = ">>>>>{$time}\n".$sqls."\n{$time}<<<<<\n";

        $this->writeLog($logs, "a", '/tmp', '.sql');
    }

    protected function writeAppLog($logs, $prex='app')
    {
        $logs = str_replace(';', ";\n", $logs);

        $time = date("Y-m-d.H:i:s");
        $logs = ">>>>>{$time}\n".$logs."\n{$time}<<<<<\n";

        $this->writeLog($logs, "a", '/tmp', '', $prex);
    }

    public function __call($method, $args)
    {
        // $this->dump($args);
        $app = Lff::App();
        if(method_exists($app, $method)) {
            $argc = count($args);
            switch ($argc) {
                case 1:
                    return $app->$method($args[0]);  break;
                case 2:
                    return $app->$method($args[0],$args[1]);  break;
                case 3:
                    return $app->$method($args[0],$args[1],$args[2]);  break;
                case 4:
                    return $app->$method($args[0],$args[1],$args[2],$args[3]);  break;
                case 5:
                    return $app->$method($args[0],$args[1],$args[2],$args[3],$args[4]);  break;
                case 6:
                    return $app->$method($args[0],$args[1],$args[2],$args[3],$args[4],$args[5]);  break;
                default:
                    return $app->$method();
            }
        }else {
            throw new Exception("$method is not exists", 1);
            return null;
        }
    }
    /*
    * desc: 在二维数组dataArr中以field为准获取它们的值序列
    *       常用于获取id序列
    * 
        输入:
        Array
        (
            [0] => Array
                (
                    [id] => 225
                    [orderid] => 716071508164084
                    [goodsid] => 2000001
                )

            [1] => Array
                (
                    [id] => 226
                    [orderid] => 716071508164084
                    [goodsid] => 2000002
                )

            [2] => Array
                (
                    [id] => 224
                    [orderid] => 454542801320413
                    [goodsid] => 2000002
                )
        )
        返回:
        Array
        (
            [0] => 2000001
            [1] => 2000002
        )
    *return array() 一定是数据
    */
    protected function GetDimensionArrayValueArray(&$dataArr, $field)
    {
        if(empty($dataArr)) return array();
        if(!isset($dataArr[0])) return array();
        $first = $dataArr[0];
        if(!isset($first[$field])) return array();
        $_valArr = array();
        foreach($dataArr as $row){
            if(!isset($row[$field]))continue;
            $_valArr[] = $row[$field];
        }
        $_valArr = array_unique($_valArr);
        return $_valArr;
    }
    /*
    * desc: 将二维数组rowArr,subArr连接在一起,
    *       连接的方式是以其中一个字段(这个字段必须是两个数组都含有的)
    *
    *@fields --- str 通常是主键id和外键id(如 id:userid)
    *
        输入:
        rowArr = array(
            'userid' = 123,
            'age' = 22
        )
        subArr = array(
            'id' = 123
            'detail' = ...
        )
        返回:
        array(
            'userid' = 123,
            'age' = 22
            '__sub' => array(
                'id' = 123
                'detail' = ...
            )
        )
    *
    */
    protected function JoinDimensionArray($rowArr, &$subArr, $fields, $subname='__sub')
    {
        if(empty($rowArr) || 
            empty($subArr) || 
            !is_array($rowArr) ||
            !is_array($subArr)
        )return $rowArr;
        list($pk,$fk) = explode(':', $fields);
        $_subArr = array();
        foreach($subArr as $rs){
            $_subArr[$rs[$pk]] = $rs;
        }
        // $this->dump($_subArr);
        // $this->dump($rowArr);
        foreach($rowArr as &$rr){
            $rr[$subname] = isset($_subArr[$rr[$fk]])?$_subArr[$rr[$fk]]:array();
        }
        return $rowArr;
    }
    /*
    * desc: 和JoinDimensionArray差不多，只是先将subArr转换成树的格式再组装到rowArr
    *       
    *
    *
    */
    protected function JoinDimensionTreeArray($rowArr, $subArr, $fields, $subname='__sub')
    {
        if(empty($rowArr) || 
            empty($subArr) || 
            !is_array($rowArr) ||
            !is_array($subArr)
        )return $rowArr;
        list($pk,$fk) = explode(':', $fields);
        CTool::table2tree($subArr, $fk);
        // $this->dump($rowArr);
        foreach($rowArr as &$rr){
            $rr[$subname] = isset($subArr[$rr[$pk]])?$subArr[$rr[$pk]]:array();
        }
        return $rowArr;
    }
};
