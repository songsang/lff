<?php
class CControllerApi extends CController {

    protected function output($var, $format='json', $isexit=true, $iscleanbuff=true)
    {
    
        ob_clean();
        if('json' == $format){
            exit(json_encode($var));
        }else{
            print_r($var);
        }
        exit(0);
    }
};
