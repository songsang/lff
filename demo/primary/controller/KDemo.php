<?php
class KDemo extends CControllerPrimary{

    
    function actionEntry()
    {
    }

    function actionDb()
    {
        // echo 'aaaaaaaaaa';
        $dbT1 = $this->LoadDbModel('t1');
        $dataArr = array('age'=>20, 'content'=>'abc\abc"me"');
        $ok = $dbT1->wh(array('id'=>0))->sets($dataArr);
        var_dump($ok);
        $this->dump($dbT1->get());
    }

};

