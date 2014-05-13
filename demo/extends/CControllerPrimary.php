<?php
class CControllerPrimary extends CController {
    var $template_login = '
        <div id="modal-login-panel" style="display:none;">
            <form action="/ucenter/login" method="post" id="form-login">
                <div style="white-space:nowrap;">
                    帐号: <input type="text" id="loginname" name="loginname" tip-box="tip-loginname">
                    <span id="tip-loginname"></span>
                </div>
                <div style="white-space:nowrap;">
                    密码: <input type="password" name="plain"> 
                </div>

                <div style="white-space:nowrap;">　　　　
                    <input type="reset" class="btn" value="重置"> 
                    <input type="submit" class="btn" value="登录">
                </div>
            </form>
        </div>
    ';//登录对话框html模板
    
    function __construct()
    {
        $this->setGlobalParamters();
        $this->setAllCate();
    }

    protected function setAllCate()
    {
        // $time_before = CTool::getUTime();
        /*
        $MCate = $this->LoadApiModel('cate');
        $allCateArr = $MCate->getFamilyTree();
        */
        /*$allCateArr = $this->GetContentCategory();
        if(!$allCateArr){
            $allCateArr = CConstHQcategory::$CATEGORY;
        }*/
		$this->assign('brand', array('brand'=>'sb111') );
        $allCateArr = CConstHQcategory::$CATEGORY;
        $this->assign('allCateArr', $allCateArr);
        // $time_after = CTool::getUTime();
        // echo $Elapse = sprintf("%.4f", $time_after - $time_before);
    }
    
    protected function setGlobalParamters()
    { 
        $session = $this->getSession();
        $this->assign('userid_sess',   $session->get('userid_sess'),   true);
        $this->assign('username_sess', $session->get('username_sess'), true);
        $this->assign('userrole_sess', $session->get('userrole_sess'), true);
        $this->assign('storeid_sess' , $session->get('storeid_sess'),  true);
        $this->assign('email_sess',    $session->get('email_sess'),    true);
        //Added By ZhuCj 2013-11-05 取登入者头像
	    $MUser = $this->LoadApiModel('user');
		$userimg_sess = $MUser->getImgByUserid($session->get('userid_sess'));
		$this->assign('useravatar_sess', $userimg_sess, true);
        
		$userConfig  = $this->getUserConfig();
        //$this->dump($userConfig);
        foreach($userConfig as $_k => $_v){
			$this->assign($_k, $_v, true);
        }
        $router = $this->getRouter();
        $this->assign('router', $router, true);
		if($session->get('userid_sess')){
			$this->getCenterSide($session->get('userid_sess'),$session->get('storeid_sess'));
		}
		
		$lang = array(
						'sitename' => '工品汇',
					 );
		$this->assign('lang',$lang);
		
    }

    protected function needLogin($reurl='/ucenter/login')
    {
        if(empty($_SESSION) || !isset($_SESSION['userid_sess'])){
            if($reurl){
                $refurl = urldecode(isset($_SERVER['REQUEST_URI'])?$_SERVER['REQUEST_URI']:'/');
                header("Location: {$reurl}?refurl={$refurl}");
                exit;
            }
        }
        
    }
    
	protected function jumpLogin($jumpurl='/ucenter/login')
    {
        $refurl = urldecode(isset($_SERVER['REQUEST_URI'])?$_SERVER['REQUEST_URI']:'/');
        ob_clean();
        header("Location: {$jumpurl}?refurl={$refurl}");
        exit;
    }
	
	//页面跳转
	protected function location($jumpurl='/ucenter/login')
	{
		$this->jumpLogin($jumpurl);
	}
    
	//当用户没有店铺或者店铺没审核时处理的页面
	protected function errorScenter(){
		$this->location('/ucenter/shop/apply');
	}
	
	/*
		得到左侧菜单相关数据的操作
		type: 1=>ucenter 2=>scenter
	*/
	private function getCenterSide($loginid,$storeid){ 
		$SideNum = array();
		$request_uri = $_SERVER['REQUEST_URI'];
		$request_uri = explode('?',$request_uri); //去掉不必要的参数
		$request_uri = $request_uri[0];
		$model = $this->LoadApiModel('counter');
		if(strpos($request_uri,'ucenter') && $loginid){
			$SideNum = $model->getUcenterSide($loginid);	
		}elseif(strpos($request_uri,'scenter') && $storeid){
			$SideNum = $model->getScenterSide($storeid);	
		}
		$this->assign('SideNum',$SideNum);
	}
};
