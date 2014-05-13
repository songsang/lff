<?php
class KSite extends CControllerPrimary{

    
    function actionDefault($viewFile=null)
    {
        $this->display('index');
    }

};

