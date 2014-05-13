<?php
$baseUrl = Lff::$app->baseUrl;
$jsexUrl = Lff::$app->jsexUrl;
$cssxUrl = Lff::$app->cssxUrl;
$imgsUrl = Lff::$app->imgsUrl;
?>
<!DOCTYPE html>
<html>
<head><title>视图</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link href="<?=$cssxUrl?>/view.css" rel="stylesheet" type="text/css" />
<link href="<?=$cssxUrl?>/jquery.ui.css" rel="stylesheet" type="text/css" />
<script type='text/javascript' >
var HOMEURL = '<?=$baseUrl?>';
var JSEXURL = '<?=$jsexUrl?>';
var CSSXURL = '<?=$cssxUrl?>';
var IMGSURL = '<?=$imgsUrl?>';
</script>
<script type='text/javascript' src='<?=$jsexUrl?>/jquery1.7.2.js' ></script>
<script type='text/javascript' src='<?=$jsexUrl?>/jcomm.js' ></script>
<script type='text/javascript' src='<?=$jsexUrl?>/style.js' ></script>
</head>

<body scroll='no'>
<div class="container">
  <div id="content">
    <div id='menubar' class='menubar'>
      <table border='0' cellpadding='0' cellspacing='0' >
      <tr>
        <td style='width:8px'>&nbsp;&nbsp;</td>
        <td width='1%' nowrap><a href='javascript:void(0);' id='butmenusys'>系统  </a></td>
        <td width='1%' nowrap><a href='javascript:void(0);' id='butmenufld'>字段  </a></td>
        <td width='1%' nowrap><a href='javascript:void(0);' id='butmenutbl'>表格  </a></td>
        <td width='1%' nowrap><a href='javascript:void(0);' id='butmenudbs'>数据库</a></td>
        <td width='100%'></td>
      </tr>
      </table>
    </div>
    <div id='toolbar' class='toolbar'>
      <?=CCommon::makeToolbar()?>
    </div>

    <div id='divdata' style='border:1px solid #369; padding:2px; width:auto;important;width:99.4%; height:90%; overflow:auto;' >
      <?php echo $content; ?>
    </div>

    <div id="footer" class='footer'>
      <img alt='' src='<?=$imgsUrl?>/linked.gif'/>
      <?=Lff::$session->get('dbHost');?>->
      <?=Lff::$session->get('dbAct');?>->
      <?=Lff::$app->get('tblAct');?>
    </div>
  </div><!-- content -->
</div>
<script type='text/javascript' src='<?=$jsexUrl?>/menu.js' ></script>
<script type='text/javascript' src='<?=$jsexUrl?>/jquery.ui.js' ></script>
</body>
</html>
