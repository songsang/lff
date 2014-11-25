/**
author: cty@20140226
  name: IForm.js
  func: 表单处理相关js函数
  desc: 本文件中所包含的主要功能有:
        1, 表单验证;
        2, 用ajax提交表单,包括添加数据、修改数据和删除数据;
  备注: 基于ValidForm,bootstrap
        本js与html表单(主要是对话框)的约定:
        1,如果but-trigger按钮中没有action属性则表单中必须包括action(ajax的请求地址);
        2,触发对话的按钮必须有but-trigger属性,其值必须为要触发的对话框id;
        3,对话框中的"确定"按钮id必须为but-from-execute;
        4,but-trigger中可以有默认值(defaults="a=1&b=2&c=1,2")。如果默认值相对应的表单为数组,其值用逗号分隔;
        5,formsCommitData函数说明:
          它的功能是向后台提交数据,因此添加数据和修改数据都采用它,
          只不过是提交的数据不一样而已,如url,cdtion(条件)等
        6,以下是html示例;
            按钮:
            <a class="btn" but-trigger-write="modal-create-tag" >添加数据</a>
          对话框:
            <div class='modal hide' id='modal-create-tag' >
                <div class='modal-header'>
                    <button type='button' class='close' data-dismiss='modal'>×</button>
                    <h3>添加标签</h3>
                </div>
                <form action='/tag/add' id='form-create-tag' >
                <div class='modal-body'>
                    <table>
                        <tr><td>标签名:</td>  
                            <td><input type='text' id='name' name='name' />
                                <span class='label label-important'>标签名只能是数据和字母</span>
                            </td></tr>
                    </table>
                </div>
                <div class='modal-footer'>
                    <a href='#' id='cancel'   class='btn btn-primary' data-dismiss='modal'>取消</a>
                    <a href='javascript:;' but-form-execute='1' class='btn btn-danger'>创建</a>
                </div>
                </form>
            </div>

*/
;(function($,WIN){
    var HTTP_STATUS = {
        400: '服务器不理解请求的语法', 
        401: '请求要求身份验证对于需要登录的网页，服务器可能返回此响应',
        403: '服务器拒绝请求',
        404: '服务器找不到请求的网页',
        405: '禁用请求中指定的方法',
        406: '无法使用请求的内容特性响应请求的网页。', 
        407: '此状态代码与 401（未授权）类似，但指定请求者应当授权使用代理。',
        408: '服务器等候请求时发生超时',
        409: '服务器在完成请求时发生冲突服务器必须在响应中包含有关冲突的信息',
        410: '如果请求的资源已永久删除，服务器就会返回此响应',
        411: '服务器不接受不含有效内容长度标头字段的请求',
        412: '服务器未满足请求者在请求中设置的其中一个前提条件',
        413: '服务器无法处理请求，因为请求实体过大，超出服务器的处理能力',
        414: '请求的 URI（通常为网址）过长，服务器无法处理',
        415: '请求的格式不受请求页面的支持',
        416: '如果页面无法提供请求的范围，则服务器会返回此状态代码',
        417: '服务器未满足"期望"请求标头字段的要求。',
        500: '服务器遇到错误，无法完成请求',
        501: '服务器不具备完成请求的功能例如，服务器无法识别请求方法时可能会返回此代码。', 
        502: '服务器作为网关或代理，从上游服务器收到无效响应',
        503: '服务器目前无法使用（由于超载或停机维护）通常，这只是暂时状态',
        504: '服务器作为网关或代理，但是没有及时从上游服务器收到请求',
        505: '服务器不支持请求中所用的 HTTP 协议版本'
    };

    //end 表单验证类
    /*
    * IForm仅仅是显示对话框和显示默认值,验证的事情交给ValidForm来处理
    *@settings ---  {
    *                   iformtype: dialog(对话框模式) | form(表单模式)
    *               }
    *
    */
    $.fn.extend({
        IForm : function(settings){
            settings = settings || {};
            settings.validform_settings = settings.validform_settings || {};
            var selector = $(this).selector.replace('[','').replace(']','');
            WIN.IForm     = this;
            var triggers  = $(this);
            triggers.each(function(){
                var trigger = $(this); //触发按钮
                var iformtype = trigger.attr('iform-type') || 'dialog'; //dialog || form || delete
                if('dialog' == iformtype){
                    trigger.click(function(){
                        //1,找到对话框=========================================
                        var modalid = '#' + trigger.attr(selector); //对话框id
                        var modal   = $(modalid);
                        if(modal.length <= 0)return false; //没有对话框
                        // alert(modalid);
                        
                        //2,找到form===========================================
                        var JForm = modal.find("form").not("[iform-ignored]");
                        if(JForm.length <= 0)return false;  //没有form表单
                        
                        //3,设置配置===========================================
                        var iform_action = trigger.attr('iform-action');
                        var iform_method = trigger.attr('iform-method');
                        var iform_params = trigger.attr('iform-params'); //附加参数 a=1&b=2
                        var iform_dialog_title = trigger.attr('iform-dialog-title');
                        var iform_text_submit  = trigger.attr('iform-text-submit'); 
                        var iform_text_cancel  = trigger.attr('iform-text-cancel');
                        if(iform_action) JForm.prop('action', iform_action);
                        if(iform_params){
                            var vf_params = WIN.IForm._parse_url(iform_params);
                            var vf_params_arr = new Array();
                            for(var k in vf_params){
                                vf_params_arr.push({name:k, value:vf_params[k]})
                            }
                            settings.validform_settings.params = vf_params_arr;
                        }
                        if(iform_dialog_title){
                            modal.find("[iform-dialog-title]").text(iform_dialog_title)
                        }
                        if(iform_text_submit){
                            JForm.find("input[type='submit']").val(iform_text_submit)
                        }
                        
                        //4,设置默认值=========================================
                        var jDefault = WIN.IForm._parse_url(trigger.attr('iform-defaults'));
                        WIN.IForm._set_defaults(JForm, jDefault);
                        WIN.IForm._switch_fileds_active(JForm);
                        WIN.IForm._switch_fileds_active_all(JForm);
                        JForm.find('[iform-field-switcher]').trigger('change');
                        
                        //5,添加ValidForm事件==================================
                        WIN.IForm._valid_form(JForm, settings);
                        
                        //6,显示对话框=========================================
                        modal.modal();


                        //7,保存变量到GObj
                        WIN.IForm.Dialog = modal;
                    });
                }else if('delete' == iformtype){
                    trigger.click(function(){
                        var url    = $(this).attr('iform-action');
                        var data   = $(this).attr('iform-params') || {};
                        var msg    = $(this).attr('iform-title') || '是否继续?';
                        var reload = $(this).attr('iform-reload') || false;
                        WIN.IForm._show_confirm({msg:msg,fcb:function(){
                            WIN.IForm._show_pop_dialog('正在执行，请稍候...','',{backdrop_click:false});
                            $.ajax({url:url, type:'post', dataType:'json', data:data,  
                                success:function(json){
                                    if(1 == parseInt(json.status)) {
                                        if(reload){
                                            setTimeout(function(){
                                                window.location.reload();
                                            },500);
                                        }
                                        WIN.IForm._show_pop_dialog(json.message);
                                    }else {
                                        // alert(json.message);
                                        WIN.IForm._show_pop_dialog(json.message);
                                    }
                                },error:function(data){
                                    try{
                                        var status  = parseInt(data.status);
                                        var message = HTTP_STATUS[status] + '!';
                                    }catch(e){
                                        var message = '服务器错误，请稍候试!';
                                    }
                                    WIN.IForm._show_pop_dialog(message);
                                    // if('function' == typeof(para.fcbErr)){
                                        // para.fcbErr();
                                    // }
                                }
                            });
                        }});
                    });
                }else{
                    var JForm = $(this); //此时和validform一样，直接选择form即可
                    WIN.IForm._valid_form(JForm, settings);
                    WIN.IForm.Dialog = null;
                }
            });
            return;
            
            alert(modalid);
            var modal   = $(modalid);
            var tipbox  = modal.find('#modal-tips-box');
            var butExecute = modal.find('[but-form-execute]'); //确定按钮
            var wmodal  = modal.attr('data-width');

            //设置title
            var title = $(this).attr('title');
            var old_title = $(modalid).find('.modal-header h3').html();
                title = title ? title : (old_title?old_title:"添加/修改数据");
            if(title){
                $(modalid).find('.modal-header h3').html(title);
            }
            //设置确定按钮的标签
            var butText = $(this).attr('label-execute');
                butText = butText || "确定";
            butExecute.html(butText);
            
            //阻止form表单的submit事件
            form.submit(function(){return false;});
            form[0].reset();
            
            $(modalid).modal({width:parseInt(wmodal)});
            //设置默认值(在便新数据时有用)
            
        },
        //ValidForm验证处理
        _valid_form : function(JForm, settings){
            settings = settings || {};
            var validform_settings = settings.validform_settings || {};
            // console.log('validform_settings:', validform_settings);
            validform_settings = $.extend({
                tiptype:3,
                postonce:true,
                label:".iform-label",
                showAllError:true,
                // datatype:{
                //     "zh1-6":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,6}$/
                // },
                tipSweep:false,
                onlyValid:true,
                ajaxPost:true,
                callback:function(data, err1, err2){
                    /*
                    console.log(data);
                    var header   = null;
                    if('function' == typeof(data.state)){
                        header = data.state();
                    }*/
                    var httpcode = parseInt(data.status);
                    if(HTTP_STATUS[httpcode]){
                        WIN.IForm._show_message(HTTP_STATUS[httpcode]);
                    }else{
                        var msg = data.message || '未知消息！';
                        WIN.IForm._show_message(msg);
                    }
                    if('function' == typeof(settings.fcbRequested)){
                        settings.fcbRequested(data, vform);
                    }
                }
            }, validform_settings);
            var vform = JForm.Validform(validform_settings);
        },
        _show_confirm : function(settings){
            settings = settings || {};
            var msg = settings.msg || '是否继续？';
            var title = settings.title || '消息确认';
            var fcbConfirm = settings.fcb;
            //显示对话框
            var modal_id  = 'modal-form-confirm';
            var tpl_modal = ""
                + "<div class='modal hide' id='--modalid--' >"
                + "    <div class='modal-header'>"
                + "        <button type='button' class='close' data-dismiss='modal'>×</button>"
                + "        <h3>--title--</h3>"
                + "    </div>"
                + "    <div class='modal-body'>--msg--"
                + "    </div>"
                + "    <div class='modal-footer'>";
                if('function' == typeof(fcbConfirm)){
                    tpl_modal += ""
                    + "        <a href='javascript:;' id='cancel' class='btn btn-primary' data-dismiss='modal'>取消</a>"
                    + "        <a href='javascript:;' class='btn btn-danger' data-yes='modal'>确定</a>";
                }else{
                    tpl_modal += ""
                    + "        <a href='javascript:;' id='cancel' class='btn btn-primary' data-dismiss='modal'>确定</a>"
                }
                tpl_modal += ""
                + "    </div>"
                + "</div>"
                + "";
                
            tpl_modal = tpl_modal.replace("--modalid--", modal_id).replace('--msg--',msg).replace('--title--',title);
            var jModal = $('#'+modal_id);
            if(0 == jModal.length){
                $('body').append(tpl_modal);
                jModal = $('#'+modal_id);
            }else{
                jModal.find('.modal-body').html(msg);
            }
            var settings = $.extend(
                {
                    remove:true,
                    width:400,
                    backdrop_click:true,
                    fcbYes:function(modal){
                        if('function' == typeof(fcbConfirm)){
                            fcbConfirm();
                        }
                    }
                },
                settings
            );
            jModal.modal(settings);
            //end 显示对话框
        },
        _show_pop_dialog : function(msg, title, opts){
            title = title || '消息提示';
            opts  = opts || {};
            opts  = $.extend({msg:msg,title:title},opts);
            WIN.IForm._show_confirm(opts);
        },
        _show_message : function(msg){
            if(!msg) return;
            var tipbox = WIN.IForm.Dialog ? WIN.IForm.Dialog.find('#iform-message') : $('body').find('#iform-message');
            if(tipbox && tipbox.length > 0){
                tipbox.hide();
                var html = "<div class='alert alert-error'>"+msg+"</div>";
                tipbox.append(html);
                tipbox.slideDown(200, function(){
                    if($(window).scrollTop()>(tipbox.offset().top+tipbox.outerHeight())){
                        $(window).scrollTop(tipbox.offset().top-tipbox.outerHeight()-2);
                    }
                });
                setTimeout(function(){
                    tipbox.slideUp(200,function(){
                        tipbox.html('');
                    });
                    
                }, 5000);
            }else{
                alert(msg);
            }
        },

        /*设置默认值
        *
        *@defaults --- json
        *
        */
        _set_defaults : function(JForm, jDefault, settings){
            // var defaults  = $(this).attr('defaults') ;//'name=aaaaaaaaaa&company_id=33&num=bbb&city=123,456';//测试数据
            jDefault = jDefault || {};
            JForm.get(0).reset(); //清空数据
            // alert('清空数据');
            // JForm.find('[iform-field-switcher]').trigger('change');
            // alert(JForm.find('[iform-field-switcher]').length);
            if(jDefault){
                // console.log('--------------');
                JForm.find('input,select,textarea').not('[type="button"]').each(function(){
                    var id      = $(this).attr('id');
                    var name    = $(this).attr('name');
                    var _name   = name?name.replace('[]',''):''; //预防表单数组
                    var tagName = $(this).get(0).tagName;
                    // alert(_name)
                    var val     = jDefault[_name];
                    if(val){
                        val     = decodeURIComponent(jDefault[_name]);
                        var isArr   = name.indexOf('[]');//表单数组
                        // console.log($(this).get(0).tagName,id,val,name,isArr);
                        if('SELECT' == tagName){
                            JForm.find('#'+id+" option[value='"+val+"']").attr('selected',true);
                        }else{ //input
                            var _type = $(this).attr('type')
                            // alert(_type);
                            if('radio'==_type){
                                JForm.find("[name='"+name+"'][value='"+val+"']").prop('checked',true);
                            }else if('checkbox'==_type){
                                if(isArr > -1){//表示些复选框数组
                                    var vArr = val.split(',');
                                    for(var k in vArr){
                                        var v = vArr[k]
                                        JForm.find("[name='"+_name+"\[\]'][value='"+v+"']").prop('checked',true);
                                        // alert(form.find("[name='city\[\]'][value='456']").attr('checked',true))
                                    }
                                }else{
                                    JForm.find("[name='"+name+"'][value='"+val+"']").prop('checked',true);
                                }
                            }else{
                                // JForm.find('#'+id).val(val);
                                // console.log(name, val);
                                JForm.find('[name="'+name+'"]').val(val);
                            }
                        }
                    }
                });
            }
        },
        _switch_fileds_active : function(JForm){
            JForm.find("[iform-field-switcher]").change(function(){
                var _filedids = $(this).attr('iform-field-switcher');

                var _disable  = $(this).is(":checked")?false:true;
                if(_filedids.indexOf('[]') > 0){
                    JForm.find('[name="'+_filedids+'"]').prop("disabled", _disable);
                }else{
                    var _fid_arr  = _filedids.split(',');
                    for(var i in _fid_arr){
                        JForm.find('#'+_fid_arr[i]).prop("disabled", _disable);
                    }
                }
            });
        },
        _switch_fileds_active_all : function(JForm){
            JForm.find("[iform-field-switcher-all]").click(function(){
                var _checked = $(this).is(":checked")?true:false;
                JForm.find('[iform-field-switcher]').prop("checked", _checked).trigger('change');
            });
        },
        /**
         * @url可以是http://www.baidu.com?id=45，也可以直接是后面的get值，比如id=45&price=98
        */
        _parse_url : function(url) {
            if('string' != typeof(url)) return null;
            var value = url.split("?")[1];
            if(value === undefined) value = url;
            var obj = {};
            if (typeof(value) != 'undefined' && value != '') {
                var temp = value.split("&");
                for(var i = 0; i < temp.length; i++) {
                    var str = temp[i].split("=");
                    obj[str[0]] = str[1];
                }
                return obj;
            }
            return null;
        }
    });
})(jQuery, window);

/**
 * 通用表单验证方法
 * Validform version 5.3.2
 * By sean during April 7, 2010 - March 26, 2013
 * For more information, please visit http://validform.rjboy.cn
 * Validform is available under the terms of the MIT license.
 * 
 * Demo:
 * $(".demoform").Validform({//$(".demoform")指明是哪一表单需要验证,名称需加在form表单上;
 *     btnSubmit:"#btn_sub", //#btn_sub是该表单下要绑定点击提交表单事件的按钮;如果form内含有submit按钮该参数可省略;
 *     btnReset:".btn_reset",//可选项 .btn_reset是该表单下要绑定点击重置表单事件的按钮;
 *     tiptype:1, //可选项 1=>pop box,2=>side tip(parent.next.find; with default pop),3=>side tip(siblings; with default pop),4=>side tip(siblings; none pop)，默认为1，也可以传入一个function函数，自定义提示信息的显示方式（可以实现你想要的任何效果，具体参见demo页）;
 *     ignoreHidden:false,//可选项 true | false 默认为false，当为true时对:hidden的表单元素将不做验证;
 *     dragonfly:false,//可选项 true | false 默认false，当为true时，值为空时不做验证；
 *     tipSweep:true,//可选项 true | false 默认为false，只在表单提交时触发检测，blur事件将不会触发检测（实时验证会在后台进行，不会显示检测结果）;
 *     label:".label",//可选项 选择符，在没有绑定nullmsg时查找要显示的提示文字，默认查找".Validform_label"下的文字;
 *     showAllError:false,//可选项 true | false，true：提交表单时所有错误提示信息都会显示，false：一碰到验证不通过的就停止检测后面的元素，只显示该元素的错误信息;
 *     postonce:true, //可选项 表单是否只能提交一次，true开启，不填则默认关闭;
 *     ajaxPost:true, //使用ajax方式提交表单数据，默认false，提交地址就是action指定地址;
 *     datatype:{//传入自定义datatype类型，可以是正则，也可以是函数（函数内会传入一个参数）;
 *         "*6-20": /^[^\s]{6,20}$/,
 *         "z2-4" : /^[\u4E00-\u9FA5\uf900-\ufa2d]{2,4}$/,
 *         "username":function(gets,obj,curform,regxp){
 *             //参数gets是获取到的表单元素值，obj为当前表单元素，curform为当前验证的表单，regxp为内置的一些正则表达式的引用;
 *             var reg1=/^[\w\.]{4,16}$/,
 *                 reg2=/^[\u4E00-\u9FA5\uf900-\ufa2d]{2,8}$/;
 *             
 *             if(reg1.test(gets)){return true;}
 *             if(reg2.test(gets)){return true;}
 *             return false;
 *             
 *             //注意return可以返回true 或 false 或 字符串文字，true表示验证通过，返回字符串表示验证失败，字符串作为错误提示显示，返回false则用errmsg或默认的错误提示;
 *         },
 *         "phone":function(){
 *             // 5.0 版本之后，要实现二选一的验证效果，datatype 的名称 不 需要以 "option_" 开头;	
 *         }
 *     },
 *     usePlugin:{
 *         swfupload:{},
 *         datepicker:{},
 *         passwordstrength:{},
 *         jqtransform:{
 *             selector:"select,input"
 *         }
 *     },
 *     beforeCheck:function(curform){
 *         //在表单提交执行验证之前执行的函数，curform参数是当前表单对象。
 *         //这里明确return false的话将不会继续执行验证操作;	
 *     },
 *     beforeSubmit:function(curform){
 *         //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
 *         //这里明确return false的话表单将不会提交;	
 *     },
 *     callback:function(data){
 *         //返回数据data是json格式，{"info":"demo info","status":"y"}
 *         //info: 输出提示信息;
 *         //status: 返回提交数据的状态,是否提交成功。如可以用"y"表示提交成功，"n"表示提交失败，在ajax_post.php文件返回数据里自定字符，主要用在callback函数里根据该值执行相应的回调操作;
 *         //你也可以在ajax_post.php文件返回更多信息在这里获取，进行相应操作；
 *         //ajax遇到服务端错误时也会执行回调，这时的data是{ status:**, statusText:**, readyState:**, responseText:** }；
 *         
 *         //这里执行回调操作;
 *         //注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。
 *     }
 * });
 * 
 * Validform对象的方法和属性：
 * tipmsg：自定义提示信息，通过修改Validform对象的这个属性值来让同一个页面的不同表单使用不同的提示文字；
 * dataType：获取内置的一些正则；
 * eq(n)：获取Validform对象的第n个元素;
 * ajaxPost(flag,sync,url)：以ajax方式提交表单。flag为true时，跳过验证直接提交，sync为true时将以同步的方式进行ajax提交，传入了url地址时，表单会提交到这个地址；
 * abort()：终止ajax的提交；
 * submitForm(flag,url)：以参数里设置的方式提交表单，flag为true时，跳过验证直接提交，传入了url地址时，表单会提交到这个地址；
 * resetForm()：重置表单；
 * resetStatus()：重置表单的提交状态。传入了postonce参数的话，表单成功提交后状态会设置为"posted"，重置提交状态可以让表单继续可以提交；
 * getStatus()：获取表单的提交状态，normal：未提交，posting：正在提交，posted：已成功提交过；
 * setStatus(status)：设置表单的提交状态，可以设置normal，posting，posted三种状态，不传参则设置状态为posting，这个状态表单可以验证，但不能提交；
 * ignore(selector)：忽略对所选择对象的验证；
 * unignore(selector)：将ignore方法所忽略验证的对象重新获取验证效果；
 * addRule(rule)：可以通过Validform对象的这个方法来给表单元素绑定验证规则；
 * check(bool,selector):对指定对象进行验证(默认验证当前整个表单)，通过返回true，否则返回false（绑定实时验证的对象，格式符合要求时返回true，而不会等ajax的返回结果），bool为true时则只验证不显示提示信息；
 * config(setup):可以通过这个方法来修改初始化参数，指定表单的提交地址，给表单ajax和实时验证的ajax里设置参数；
*/

;(function($,win,undef){
	var errorobj=null,//指示当前验证失败的表单元素;
		msgobj=null,//pop box object 
		msghidden=true;//msgbox hidden?

	var tipmsg={//默认提示文字;
		tit:"提示信息",
		w:{
			"*":"不能为空！",
			"*6-16":"请填写6到16位任意字符！",
			"n":"请填写数字！",
			"n6-16":"请填写6到16位数字！",
			"f":"请填写数值！",
			"f6-16":"请填写6到16位浮点数！",
			"s":"不能输入特殊字符！",
			"s6-18":"请填写6到18位字符！",
			"p":"请填写邮政编码！",
			"m":"请填写手机号码！",
			"e":"邮箱地址格式不对！",
            "d":"日期格式不对！",
			"url":"请填写网址！",
            'zh':"请输入中文！"
		},
		def:"请填写正确信息！",
		undef:"datatype未定义！",
		reck:"两次输入的内容不一致！",
		r:"数据验证合法",
		c:"正在检测信息…",
		s:"请{填写|选择}{0|信息}！",
		v:"所填信息没有经过验证，请稍后…",
		p:"正在提交数据…"
	}
	$.Tipmsg=tipmsg;

	var Validform=function(forms,settings,inited){
		var settings=$.extend({},Validform.defaults,settings);
		settings.datatype && $.extend(Validform.util.dataType,settings.datatype);
		
		win.settings  = settings;
		win.validated = true; //标识验证是否成功

		var brothers=this;
		brothers.tipmsg={w:{}};
		brothers.forms=forms;
		brothers.objects=[];
		
		//创建子对象时不再绑定事件;
		if(inited===true){
			return false;
		}
		
		forms.each(function(){
			//已经绑定事件时跳过，避免事件重复绑定;
			if(this.validform_inited=="inited"){return true;}
			this.validform_inited="inited";
			
			var curform=this;
			curform.settings=$.extend({},settings);
			
			var $this=$(curform);
			
			//防止表单按钮双击提交两次;
			curform.validform_status="normal"; //normal | posting | posted;
			
			//让每个Validform对象都能自定义tipmsg;	
			$this.data("tipmsg",brothers.tipmsg);

			//bind the blur event;
			$this.delegate("[datatype]","blur click change",function(){
				//判断是否是在提交表单操作时触发的验证请求；
				var subpost=arguments[1];
				win.validated = Validform.util.check.call(this,$this,subpost);
			});
			
			$this.delegate(":text","keypress",function(event){
				if(event.keyCode==13 && $this.find(":submit").length==0){
					$this.submit();
				}
			});
			
			//点击表单元素，默认文字消失效果;
			//表单元素值比较时的信息提示增强;
			//radio、checkbox提示信息增强;
			//外调插件初始化;
			Validform.util.enhance.call($this,curform.settings.tiptype,curform.settings.usePlugin,curform.settings.tipSweep);
			
			curform.settings.btnSubmit && $this.find(curform.settings.btnSubmit).bind("click",function(){
				$this.trigger("submit");
				return false;
			});
			$this.submit(function(){
				var a =1 ;
                var subflag=Validform.util.submitForm.call($this,curform.settings);
                
				subflag === undef && (subflag=true);
				win.validated = subflag;
				return curform.settings.onlyValid ? false: true;
			});
			$this.find("[type='reset']").add($this.find(curform.settings.btnReset)).bind("click",function(){
				Validform.util.resetForm.call($this);
			});

			//扩展
			$this.find("[datatype]").eq(0).trigger('blur'); //只触发第一个
		});
		
		//预创建pop box;
		if( settings.tiptype==1 || (settings.tiptype==2 || settings.tiptype==3) && settings.ajaxPost ){		
			// creatMsgbox();
		}
	}
	
	Validform.defaults={
		tiptype:1,
		tipSweep:false,
		showAllError:false,
		postonce:false,
		ajaxPost:false,

		onlyValid:false, //是否为仅仅为验证
		popmodal:false,  //是否显示弹出层

		a:1
	}
	
	Validform.util={
		dataType:{
			"*":/[\w\W]+/,
			"*6-16":/^[\w\W]{6,16}$/,
			"n":/^\d+$/,
			"n6-16":/^\d{6,16}$/,
			"f":/^[\d\.\+\-\(\)\,]+$/,
			"f6-16":/^[\d\.]{6,16}$/,
			"s":/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/,
			"s6-18":/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/,
			"p":/^[0-9]{6}$/,
			"m":/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,
			"e":/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            "d":/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/,
			"url":/^(\w+:\/\/)?\w+(\.\w+)+.*$/,
            "zh":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,}$/
		},
		
		toString:Object.prototype.toString,
		
		isEmpty:function(val){
			return val==="" || val===$.trim(this.attr("tip"));
		},
		
		getValue:function(obj){
			var inputval,
				curform=this;
				
			if(obj.is(":radio")){
				inputval=curform.find(":radio[name='"+obj.attr("name")+"']:checked").val();
				inputval= inputval===undef ? "" : inputval;
			}else if(obj.is(":checkbox")){
				inputval="";
				curform.find(":checkbox[name='"+obj.attr("name")+"']:checked").each(function(){ 
					inputval +=$(this).val()+','; 
				})
				inputval= inputval===undef ? "" : inputval;
			}else{
				inputval=obj.val();
			}
			inputval=$.trim(inputval);
			
			return Validform.util.isEmpty.call(obj,inputval) ? "" : inputval;
		},
        getAttributes:function(obj, key){
            var attributes = {};
                key = key || 'ajax-data-';
            try{
                if(obj.length ) {
                    $.each(obj.get(0).attributes, function( index, attr ){
                        if(attr.name.indexOf(key) >= 0){
                            var attr_name = attr.name.replace(key, '');
                            attributes[attr_name] = attr.value;
                        }
                    } ); 
                }
            }catch(e){}
            return attributes;
        },
		enhance:function(tiptype,usePlugin,tipSweep,addRule){
			var curform=this;
			
			//页面上不存在提示信息的标签时，自动创建;
			curform.find("[datatype]").each(function(){
				if(tiptype==2){
					if($(this).parent().next().find(".tip").length==0){
						$(this).parent().next().append("<span class='tip' />");
						$(this).siblings(".tip").remove();
					}
				}else if(tiptype==3 || tiptype==4){
					if($(this).siblings(".tip").length==0){
						$(this).parent().append("<span class='tip' />");
						$(this).parent().next().find(".tip").remove();
					}
				}
			})
			
			//表单元素值比较时的信息提示增强;
			curform.find("input[recheck]").each(function(){
				//已经绑定事件时跳过;
				if(this.validform_inited=="inited"){return true;}
				this.validform_inited="inited";
				
				var _this=$(this);
				var recheckinput=curform.find("input[name='"+$(this).attr("recheck")+"']");
				recheckinput.bind("keyup",function(){
					if(recheckinput.val()==_this.val() && recheckinput.val() != ""){
						if(recheckinput.attr("tip")){
							if(recheckinput.attr("tip") == recheckinput.val()){return false;}
						}
						_this.trigger("blur");
					}
				}).bind("blur",function(){
					if(recheckinput.val()!=_this.val() && _this.val()!=""){
						if(_this.attr("tip")){
							if(_this.attr("tip") == _this.val()){return false;}	
						}
						_this.trigger("blur");
					}
				});
			});
			
			//hasDefaultText;
			curform.find("[tip]").each(function(){//tip是表单元素的默认提示信息,这是点击清空效果;
				//已经绑定事件时跳过;
				if(this.validform_inited=="inited"){return true;}
				this.validform_inited="inited";
				
				var defaultvalue=$(this).attr("tip");
				var altercss=$(this).attr("altercss");
				$(this).focus(function(){
					if($(this).val()==defaultvalue){
						$(this).val('');
						if(altercss){$(this).removeClass(altercss);}
					}
				}).blur(function(){
					if($.trim($(this).val())===''){
						$(this).val(defaultvalue);
						if(altercss){$(this).addClass(altercss);}
					}
				});
			});
			
			//enhance info feedback for checkbox & radio;
			curform.find(":checkbox[datatype],:radio[datatype]").each(function(){
				//已经绑定事件时跳过;
				if(this.validform_inited=="inited"){return true;}
				this.validform_inited="inited";
				
				var _this=$(this);
				var name=_this.attr("name");
				curform.find("[name='"+name+"']").filter(":checkbox,:radio").bind("click",function(){
					//避免多个事件绑定时的取值滞后问题;
					setTimeout(function(){
						_this.trigger("blur");
					},0);
				});
				
			});
			
			//select multiple;
			curform.find("select[datatype][multiple]").bind("click",function(){
				var _this=$(this);
				setTimeout(function(){
					_this.trigger("blur");
				},0);
			});
			
			//plugins here to start;
			Validform.util.usePlugin.call(curform,usePlugin,tiptype,tipSweep,addRule);
		},
		
		usePlugin:function(plugin,tiptype,tipSweep,addRule){
			/*
				plugin:settings.usePlugin;
				tiptype:settings.tiptype;
				tipSweep:settings.tipSweep;
				addRule:是否在addRule时触发;
			*/

			var curform=this,
				plugin=plugin || {};
			//swfupload;
			if(curform.find("input[plugin='swfupload']").length && typeof(swfuploadhandler) != "undefined"){
				
				var custom={
						custom_settings:{
							form:curform,
							showmsg:function(msg,type,obj){
								Validform.util.showmsg.call(curform,msg,tiptype,{obj:curform.find("input[plugin='swfupload']"),type:type,sweep:tipSweep});	
							}	
						}	
					};

				custom=$.extend(true,{},plugin.swfupload,custom);
				
				curform.find("input[plugin='swfupload']").each(function(n){
					if(this.validform_inited=="inited"){return true;}
					this.validform_inited="inited";
					
					$(this).val("");
					swfuploadhandler.init(custom,n);
				});
				
			}
			
			//datepicker;
			if(curform.find("input[plugin='datepicker']").length && $.fn.datePicker){
				plugin.datepicker=plugin.datepicker || {};
				
				if(plugin.datepicker.format){
					Date.format=plugin.datepicker.format; 
					delete plugin.datepicker.format;
				}
				if(plugin.datepicker.firstDayOfWeek){
					Date.firstDayOfWeek=plugin.datepicker.firstDayOfWeek; 
					delete plugin.datepicker.firstDayOfWeek;
				}

				curform.find("input[plugin='datepicker']").each(function(n){
					if(this.validform_inited=="inited"){return true;}
					this.validform_inited="inited";
					
					plugin.datepicker.callback && $(this).bind("dateSelected",function(){
						var d=new Date( $.event._dpCache[this._dpId].getSelected()[0] ).asString(Date.format);
						plugin.datepicker.callback(d,this);
					});
					$(this).datePicker(plugin.datepicker);
				});
			}
			
			//passwordstrength;
			if(curform.find("input[plugin*='passwordStrength']").length && $.fn.passwordStrength){
				plugin.passwordstrength=plugin.passwordstrength || {};
				plugin.passwordstrength.showmsg=function(obj,msg,type){
					Validform.util.showmsg.call(curform,msg,tiptype,{obj:obj,type:type,sweep:tipSweep});
				};
				
				curform.find("input[plugin='passwordStrength']").each(function(n){
					if(this.validform_inited=="inited"){return true;}
					this.validform_inited="inited";
					
					$(this).passwordStrength(plugin.passwordstrength);
				});
			}
			
			//jqtransform;
			if(addRule!="addRule" && plugin.jqtransform && $.fn.jqTransSelect){
				if(curform[0].jqTransSelected=="true"){return;};
				curform[0].jqTransSelected="true";
				
				var jqTransformHideSelect = function(oTarget){
					var ulVisible = $('.jqTransformSelectWrapper ul:visible');
					ulVisible.each(function(){
						var oSelect = $(this).parents(".jqTransformSelectWrapper:first").find("select").get(0);
						//do not hide if click on the label object associated to the select
						if( !(oTarget && oSelect.oLabel && oSelect.oLabel.get(0) == oTarget.get(0)) ){$(this).hide();}
					});
				};
				
				/* Check for an external click */
				var jqTransformCheckExternalClick = function(event) {
					if ($(event.target).parents('.jqTransformSelectWrapper').length === 0) { jqTransformHideSelect($(event.target)); }
				};
				
				var jqTransformAddDocumentListener = function (){
					$(document).mousedown(jqTransformCheckExternalClick);
				};
				
				if(plugin.jqtransform.selector){
					curform.find(plugin.jqtransform.selector).filter('input:submit, input:reset, input[type="button"]').jqTransInputButton();
					curform.find(plugin.jqtransform.selector).filter('input:text, input:password').jqTransInputText();			
					curform.find(plugin.jqtransform.selector).filter('input:checkbox').jqTransCheckBox();
					curform.find(plugin.jqtransform.selector).filter('input:radio').jqTransRadio();
					curform.find(plugin.jqtransform.selector).filter('textarea').jqTransTextarea();
					if(curform.find(plugin.jqtransform.selector).filter("select").length > 0 ){
						 curform.find(plugin.jqtransform.selector).filter("select").jqTransSelect();
						 jqTransformAddDocumentListener();
					}
					
				}else{
					curform.jqTransform();
				}
				
				curform.find(".jqTransformSelectWrapper").find("li a").click(function(){
					$(this).parents(".jqTransformSelectWrapper").find("select").trigger("blur");	
				});
			}

		},
		
		getNullmsg:function(curform){
			var obj=this;
			var reg=/[\u4E00-\u9FA5\uf900-\ufa2da-zA-Z\s]+/g;
			var nullmsg;
			
			var label=curform[0].settings.label || ".Validform_label";
			label=obj.siblings(label).eq(0).text() || obj.siblings().find(label).eq(0).text() || obj.parent().siblings(label).eq(0).text() || obj.parent().siblings().find(label).eq(0).text();
			label=label.replace(/\s(?![a-zA-Z])/g,"").match(reg);
			label=label? label.join("") : [""];

			reg=/\{(.+)\|(.+)\}/;
			nullmsg=curform.data("tipmsg").s || tipmsg.s;
			
			if(label != ""){
				nullmsg=nullmsg.replace(/\{0\|(.+)\}/,label);
				if(obj.attr("recheck")){
					nullmsg=nullmsg.replace(/\{(.+)\}/,"");
					obj.attr("nullmsg",nullmsg);
					return nullmsg;
				}
			}else{
				nullmsg=obj.is(":checkbox,:radio,select") ? nullmsg.replace(/\{0\|(.+)\}/,"") : nullmsg.replace(/\{0\|(.+)\}/,"$1");
			}
			nullmsg=obj.is(":checkbox,:radio,select") ? nullmsg.replace(reg,"$2") : nullmsg.replace(reg,"$1");
			
			obj.attr("nullmsg",nullmsg);
			return nullmsg;
		},
		
		getErrormsg:function(curform,datatype,recheck){
			var regxp=/^(.+?)((\d+)-(\d+))?$/,
				regxp2=/^(.+?)(\d+)-(\d+)$/,
				regxp3=/(.*?)\d+(.+?)\d+(.*)/,
				mac=datatype.match(regxp),
				temp,str;
			
			//如果是值不一样而报错;
			if(recheck=="recheck"){
				str=curform.data("tipmsg").reck || tipmsg.reck;
				return str;
			}
			
			var tipmsg_w_ex=$.extend({},tipmsg.w,curform.data("tipmsg").w);
			
			//如果原来就有，直接显示该项的提示信息;
			if(mac[0] in tipmsg_w_ex){
				return curform.data("tipmsg").w[mac[0]] || tipmsg.w[mac[0]];
			}
			
			//没有的话在提示对象里查找相似;
			for(var name in tipmsg_w_ex){
				if(name.indexOf(mac[1])!=-1 && regxp2.test(name)){
					str=(curform.data("tipmsg").w[name] || tipmsg.w[name]).replace(regxp3,"$1"+mac[3]+"$2"+mac[4]+"$3");
					curform.data("tipmsg").w[mac[0]]=str;
					
					return str;
				}
				
			}
			
			return curform.data("tipmsg").def || tipmsg.def;
		},

		_regcheck:function(datatype,gets,obj,curform){
			var curform=curform,
				info=null,
				passed=false,
				reg=/\/.+\//g,
				regex=/^(.+?)(\d+)-(\d+)$/,
				type=3;//default set to wrong type, 2,3,4;
				
			//datatype有三种情况：正则，函数和直接绑定的正则;
			
			//直接是正则;
			if(reg.test(datatype)){
				var regstr=datatype.match(reg)[0].slice(1,-1);
				var param=datatype.replace(reg,"");
				var rexp=RegExp(regstr,param);

				passed=rexp.test(gets);

			//function;
			}else if(Validform.util.toString.call(Validform.util.dataType[datatype])=="[object Function]"){
				passed=Validform.util.dataType[datatype](gets,obj,curform,Validform.util.dataType);
				if(passed === true || passed===undef){
					passed = true;
				}else{
					info= passed;
					passed=false;
				}
			
			//自定义正则;	
			}else{
				//自动扩展datatype;
				if(!(datatype in Validform.util.dataType)){
					var mac=datatype.match(regex),
						temp;
						
					if(!mac){
						passed=false;
						info=curform.data("tipmsg").undef||tipmsg.undef;
					}else{
						for(var name in Validform.util.dataType){
							temp=name.match(regex);
							if(!temp){continue;}
							if(mac[1]===temp[1]){
								var str=Validform.util.dataType[name].toString(),
									param=str.match(/\/[mgi]*/g)[1].replace("\/",""),
									regxp=new RegExp("\\{"+temp[2]+","+temp[3]+"\\}","g");
								str=str.replace(/\/[mgi]*/g,"\/").replace(regxp,"{"+mac[2]+","+mac[3]+"}").replace(/^\//,"").replace(/\/$/,"");
								Validform.util.dataType[datatype]=new RegExp(str,param);
								break;
							}	
						}
					}
				}
				
				if(Validform.util.toString.call(Validform.util.dataType[datatype])=="[object RegExp]"){
					passed=Validform.util.dataType[datatype].test(gets);
				}
			}
			
			if(passed){
				type=2;
				var eleType = obj.attr('type');
				if('radio' == eleType){
					var _n = obj.attr('name');
					info=obj.parents().find("input[name='"+_n+"']:checked").attr("sucmsg") || curform.data("tipmsg").r||tipmsg.r;
					if(!info){
						info=obj.attr("sucmsg") || curform.data("tipmsg").r||tipmsg.r;
					}
				}else{
					info=obj.attr("sucmsg") || curform.data("tipmsg").r||tipmsg.r;
				}
				//规则验证通过后，还需要对绑定recheck的对象进行值比较;
				if(obj.attr("recheck")){
					var theother=curform.find("input[name='"+obj.attr("recheck")+"']:first");
					if(gets!=theother.val()){
						passed=false;
						type=3;
						info=obj.attr("errormsg")  || Validform.util.getErrormsg.call(obj,curform,datatype,"recheck");
					}
				}
			}else{
				info=info || obj.attr("errormsg") || Validform.util.getErrormsg.call(obj,curform,datatype);
				//验证不通过且为空时;
				if(Validform.util.isEmpty.call(obj,gets)){
					info=obj.attr("nullmsg") || Validform.util.getNullmsg.call(obj,curform);
				}
			}
			
			return{
					passed:passed,
					type:type,
					info:info
			};
			
		},
		
		regcheck:function(datatype,gets,obj){
			/*
				datatype:datatype;
				gets:inputvalue;
				obj:input object;
			*/
			var curform=this,
				info=null,
				passed=false,
				type=3;//default set to wrong type, 2,3,4;
				
			//ignore;
			if(obj.attr("ignore")==="ignore" && Validform.util.isEmpty.call(obj,gets)){				
				if(obj.data("cked")){
					info="";	
				}
				
				return {
					passed:true,
					type:4,
					info:info
				};
			}

			obj.data("cked","cked");//do nothing if is the first time validation triggered;
			
			var dtype=Validform.util.parseDatatype(datatype);
			var res;
			for(var eithor=0; eithor<dtype.length; eithor++){
				for(var dtp=0; dtp<dtype[eithor].length; dtp++){
					res=Validform.util._regcheck(dtype[eithor][dtp],gets,obj,curform);
					if(!res.passed){
						break;
					}
				}
				if(res.passed){
					break;
				}
			}
			return res;
			
		},
		
		parseDatatype:function(datatype){
			/*
				字符串里面只能含有一个正则表达式;
				Datatype名称必须是字母，数字、下划线或*号组成;
				datatype="/regexp/|phone|tel,s,e|f,e";
				==>[["/regexp/"],["phone"],["tel","s","e"],["f","e"]];
			*/

			var reg=/\/.+?\/[mgi]*(?=(,|$|\||\s))|[\w\*-]+/g,
				dtype=datatype.match(reg),
				sepor=datatype.replace(reg,"").replace(/\s*/g,"").split(""),
				arr=[],
				m=0;
				
			arr[0]=[];
			arr[0].push(dtype[0]);
			for(var n=0;n<sepor.length;n++){
				if(sepor[n]=="|"){
					m++;
					arr[m]=[];
				}
				arr[m].push(dtype[n+1]);
			}
			
			return arr;
		},

		showmsg:function(msg,type,o,triggered){
			/*
				msg:提示文字;
				type:提示信息显示方式;
				o:{obj:当前对象, type:1=>正在检测 | 2=>通过, sweep:true | false}, 
				triggered:在blur或提交表单触发的验证中，有些情况不需要显示提示文字，如自定义弹出提示框的显示方式，不需要每次blur时就马上弹出提示;
				
				tiptype:1\2\3时都有坑能会弹出自定义提示框
				tiptype:1时在triggered bycheck时不弹框
				tiptype:2\3时在ajax时弹框
				tipSweep为true时在triggered bycheck时不触发showmsg，但ajax出错的情况下要提示
			*/
			
			//如果msg为undefined，那么就没必要执行后面的操作，ignore有可能会出现这情况;
			if(msg==undef){return;}
			
			//tipSweep为true，且当前不是处于错误状态时，blur事件不触发信息显示;
			if(triggered=="bycheck" && o.sweep && (o.obj && !o.obj.is(".Validform_error") || typeof type == "function")){return;}

			$.extend(o,{curform:this});
				
			if(typeof type == "function"){
				type(msg,o,Validform.util.cssctl);
				return;
			}
			
			if(type==1 || triggered=="byajax" && type!=4 ){
				// msgobj.find(".Validform_info").html(msg); //cty
			}
			
			//tiptypt=1时，blur触发showmsg，验证是否通过都不弹框，提交表单触发的话，只要验证出错，就弹框;
			if(type==1 && triggered!="bycheck" && o.type!=2 || triggered=="byajax" && type!=4){
				msghidden=false;
				/*msgobj.find(".iframe").css("height",msgobj.outerHeight());
				msgobj.show();
				setCenter(msgobj,100);*/
			}

			if(type==2 && o.obj){
				o.obj.parent().next().find(".tip").html(msg);
				Validform.util.cssctl(o.obj.parent().next().find(".tip"),o.type);
			}
			
			if((type==3 || type==4) && o.obj){
				o.obj.siblings(".tip").html(msg);
				Validform.util.cssctl(o.obj.siblings(".tip"),o.type);
			}

		},

		cssctl:function(obj,status){
			switch(status){
				case 1:
					obj.removeClass("tip-success tip-danger").addClass("tip tip-info");//checking;
					break;
				case 2:
					obj.removeClass("tip-danger tip-info").addClass("tip-success");//passed;
					break;
				case 4:
					obj.removeClass("tip-success tip-danger tip-info").addClass("tip");//for ignore;
					break;
				default:
					obj.removeClass("tip-success tip-info").addClass("tip tip-danger");//wrong;
			}
		},
		
		check:function(curform,subpost,bool){
			/*
				检测单个表单元素;
				验证通过返回true，否则返回false、实时验证返回值为ajax;
				bool，传入true则只检测不显示提示信息;
			*/
            // if($(this).is(":disabled")) return true;
			var settings=curform[0].settings;
			var subpost=subpost || "";
			var inputval=Validform.util.getValue.call(curform,$(this));
            var attributes = Validform.util.getAttributes.call(curform, $(this), 'ajax-data-');
			name
			//隐藏或绑定dataIgnore的表单对象不做验证;
			if((settings.ignoreHidden && $(this).is(":hidden")) || $(this).is(":disabled") || $(this).data("dataIgnore")==="dataIgnore"){
				return true;
			}
			
			//dragonfly=true时，没有绑定ignore，值为空不做验证，但验证不通过;
			if(settings.dragonfly && !$(this).data("cked") && Validform.util.isEmpty.call($(this),inputval) && $(this).attr("ignore")!="ignore"){
				return false;
			}
			
			var flag=Validform.util.regcheck.call(curform,$(this).attr("datatype"),inputval,$(this));
			
			//值没变化不做检测，这时要考虑recheck情况;
			//不是在提交表单时触发的ajax验证;
			if(inputval==this.validform_lastval && !$(this).attr("recheck") && subpost==""){
				return flag.passed ? true : false;
			}

			this.validform_lastval=inputval;//存储当前值;
			
			var _this;
			errorobj=_this=$(this);
			
			if(!flag.passed){
				//取消正在进行的ajax验证;
				Validform.util.abort.call(_this[0]);
				
				if(!bool){
					//传入"bycheck"，指示当前是check方法里调用的，当tiptype=1时，blur事件不让触发错误信息显示;
					Validform.util.showmsg.call(curform,flag.info,settings.tiptype,{obj:$(this),type:flag.type,sweep:settings.tipSweep},"bycheck");
					
					!settings.tipSweep && _this.addClass("Validform_error");
				}
				return false;
			}
			
			//验证通过的话，如果绑定有ajaxurl，要执行ajax检测;
			//当ignore="ignore"时，为空值可以通过验证，这时不需要ajax检测;
			var ajaxurl=$(this).attr("ajaxurl");
			if(ajaxurl && !Validform.util.isEmpty.call($(this),inputval) && !bool){
				var inputobj=$(this);

				//当提交表单时，表单中的某项已经在执行ajax检测，这时需要让该项ajax结束后继续提交表单;
				if(subpost=="postform"){
					inputobj[0].validform_subpost="postform";
				}else{
					inputobj[0].validform_subpost="";
				}
				
				if(inputobj[0].validform_valid==="posting" && inputval==inputobj[0].validform_ckvalue){return "ajax";}
				
				inputobj[0].validform_valid="posting";
				inputobj[0].validform_ckvalue=inputval;
				Validform.util.showmsg.call(curform,curform.data("tipmsg").c||tipmsg.c,settings.tiptype,{obj:inputobj,type:1,sweep:settings.tipSweep},"bycheck");
				
				Validform.util.abort.call(_this[0]);
				
				var ajaxsetup=$.extend(true,{},settings.ajaxurl || {});
                var name = $(this).attr("name");
                var val  = encodeURIComponent(inputval);
                var data = {val:val, key:name};
                    data[name] = val;
				    data = $.extend(data, attributes);

				var localconfig={
					type: "POST",
					cache:false,
					url: ajaxurl,
					data: data,
					success: function(data){
						// if($.trim(data.status)==="y"){
						if(1 == parseInt($.trim(data.status))){
							inputobj[0].validform_valid="true";
							data.message && inputobj.attr("sucmsg",data.message);
							Validform.util.showmsg.call(curform,inputobj.attr("sucmsg") || curform.data("tipmsg").r||tipmsg.r,settings.tiptype,{obj:inputobj,type:2,sweep:settings.tipSweep},"bycheck");
							_this.removeClass("Validform_error");
							errorobj=null;
							if(inputobj[0].validform_subpost=="postform"){
								curform.trigger("submit");
							}
						}else{
							inputobj[0].validform_valid=data.message;
							Validform.util.showmsg.call(curform,data.message,settings.tiptype,{obj:inputobj,type:3,sweep:settings.tipSweep});
							_this.addClass("Validform_error");
						}
						_this[0].validform_ajax=null;
					},
					error: function(data){
						if(data.status=="200"){
							if(data.responseText=="y"){
								ajaxsetup.success({"status":"y"});
							}else{
								ajaxsetup.success({"status":"n","info":data.responseText});	
							}
							return false;
						}
						
						//正在检测时，要检测的数据发生改变，这时要终止当前的ajax。不是这种情况引起的ajax错误，那么显示相关错误信息;
						if(data.statusText!=="abort"){
							var msg="status: "+data.status+"; statusText: "+data.statusText;
						
							Validform.util.showmsg.call(curform,msg,settings.tiptype,{obj:inputobj,type:3,sweep:settings.tipSweep});
							_this.addClass("Validform_error");
						}
						
						inputobj[0].validform_valid=data.statusText;
						_this[0].validform_ajax=null;
						
						//localconfig.error返回true表示还需要执行temp_err;
						return true;
					}
				}
				
				if(ajaxsetup.success){
					var temp_suc=ajaxsetup.success;
					ajaxsetup.success=function(data){
						localconfig.success(data);
						temp_suc(data,inputobj);
					}
				}
				
				if(ajaxsetup.error){
					var temp_err=ajaxsetup.error;
					ajaxsetup.error=function(data){
						//localconfig.error返回false表示不需要执行temp_err;
						localconfig.error(data) && temp_err(data,inputobj);
					}	
				}

				ajaxsetup=$.extend({},localconfig,ajaxsetup,{dataType:"json"});
				_this[0].validform_ajax=$.ajax(ajaxsetup);
				
				return "ajax";
			}else if(ajaxurl && Validform.util.isEmpty.call($(this),inputval)){
				Validform.util.abort.call(_this[0]);
				_this[0].validform_valid="true";
			}
			
			if(!bool){
				Validform.util.showmsg.call(curform,flag.info,settings.tiptype,{obj:$(this),type:flag.type,sweep:settings.tipSweep},"bycheck");
				_this.removeClass("Validform_error");
			}
			errorobj=null;
			
			return true;
		
		},
		
		submitForm:function(settings,flg,url,ajaxPost,sync){
			/*
				flg===true时跳过验证直接提交;
				ajaxPost==="ajaxPost"指示当前表单以ajax方式提交;
			*/
			var curform=this;
			
			//表单正在提交时点击提交按钮不做反应;
			if(curform[0].validform_status==="posting"){return false;}
			
			//要求只能提交一次时;
			if(settings.postonce && curform[0].validform_status==="posted"){return false;}
			
			var beforeCheck=settings.beforeCheck && settings.beforeCheck(curform);
			if(beforeCheck===false){return false;}
			
			var flag=true,
				inflag;
				
			curform.find("[datatype]").each(function(){
				//跳过验证;
				if(flg){
					return false;
				}
				
				//隐藏或绑定dataIgnore的表单对象不做验证;
				if((settings.ignoreHidden && $(this).is(":hidden")) || $(this).is(":disabled") || $(this).data("dataIgnore")==="dataIgnore"){
					return true;
				}
				
				var inputval=Validform.util.getValue.call(curform,$(this)),
					_this;
				errorobj=_this=$(this);
				
				inflag=Validform.util.regcheck.call(curform,$(this).attr("datatype"),inputval,$(this));
				
				if(!inflag.passed){
					Validform.util.showmsg.call(curform,inflag.info,settings.tiptype,{obj:$(this),type:inflag.type,sweep:settings.tipSweep});
					_this.addClass("Validform_error");
					
					if(!settings.showAllError){
						_this.focus();
						flag=false;
						return false;
					}
					
					flag && (flag=false);
					return true;
				}
				
				//当ignore="ignore"时，为空值可以通过验证，这时不需要ajax检测;
				if($(this).attr("ajaxurl") && !Validform.util.isEmpty.call($(this),inputval)){
					if(this.validform_valid!=="true"){
						var thisobj=$(this);
						Validform.util.showmsg.call(curform,curform.data("tipmsg").v||tipmsg.v,settings.tiptype,{obj:thisobj,type:3,sweep:settings.tipSweep});
						_this.addClass("Validform_error");
						
						thisobj.trigger("blur",["postform"]);//continue the form post;
						
						if(!settings.showAllError){
							flag=false;
							return false;
						}
						
						flag && (flag=false);
						return true;
					}
				}else if($(this).attr("ajaxurl") && Validform.util.isEmpty.call($(this),inputval)){
					Validform.util.abort.call(this);
					this.validform_valid="true";
				}

				Validform.util.showmsg.call(curform,inflag.info,settings.tiptype,{obj:$(this),type:inflag.type,sweep:settings.tipSweep});
				_this.removeClass("Validform_error");
				errorobj=null;
			});
			
			if(settings.showAllError){
				curform.find(".Validform_error:first").focus();
			}
			if(flag){
				var beforeSubmit=settings.beforeSubmit && settings.beforeSubmit(curform);
				if(beforeSubmit===false){return false;}
				
				curform[0].validform_status="posting";
							
				if(settings.ajaxPost || ajaxPost==="ajaxPost"){
					//获取配置参数;
					var ajaxsetup=$.extend(true,{},settings.ajaxpost || {});
					//有可能需要动态的改变提交地址，所以把action所指定的url层级设为最低;
					ajaxsetup.url=url || ajaxsetup.url || settings.url || curform.attr("action");
					//byajax：ajax时，tiptye为1、2或3需要弹出提示框;
					if(settings.popmodal){
						Validform.util.showmsg.call(curform,curform.data("tipmsg").p||tipmsg.p,settings.tiptype,{obj:curform,type:1,sweep:settings.tipSweep},"byajax");
					}
					//方法里的优先级要高;
					//有undefined情况;
					if(sync){
						ajaxsetup.async=false;
					}else if(sync===false){
						ajaxsetup.async=true;
					}
					if(ajaxsetup.success){
						var temp_suc=ajaxsetup.success;
						ajaxsetup.success=function(data){
							settings.callback && settings.callback(data);
							curform[0].validform_ajax=null;
							if($.trim(data.status)==="y"){
								curform[0].validform_status="posted";
							}else{
								curform[0].validform_status="normal";
							}
							
							temp_suc(data,curform);
						}
					}
					if(ajaxsetup.error){
						var temp_err=ajaxsetup.error;
						ajaxsetup.error=function(data){
							settings.callback && settings.callback(data);
							curform[0].validform_status="normal";
							curform[0].validform_ajax=null;
							
							temp_err(data,curform);
						}	
					}
					var localconfig={
						type: "POST",
						async:true,
						data: curform.serializeArray(),
						success: function(data){
							if($.trim(data.status)==="y"){
								//成功提交;
								curform[0].validform_status="posted";
								Validform.util.showmsg.call(curform,data.info,settings.tiptype,{obj:curform,type:2,sweep:settings.tipSweep},"byajax");
							}else{
								//提交出错;
								curform[0].validform_status="normal";
								Validform.util.showmsg.call(curform,data.info,settings.tiptype,{obj:curform,type:3,sweep:settings.tipSweep},"byajax");
							}
							
							settings.callback && settings.callback(data);
							curform[0].validform_ajax=null;
						},
						error: function(data){
							var msg="status: "+data.status+"; statusText: "+data.statusText;
									
							Validform.util.showmsg.call(curform,msg,settings.tiptype,{obj:curform,type:3,sweep:settings.tipSweep},"byajax");
							
							settings.callback && settings.callback(data);
							curform[0].validform_status="normal";
							curform[0].validform_ajax=null;
						}
					};
                    //+++++++++++
                    if(settings.params){
                        for(var _i in settings.params){
                            localconfig.data.push(settings.params[_i]);
                        }
                    }
                    //+++++++++++
					ajaxsetup=$.extend({},localconfig,ajaxsetup,{dataType:"json"});
					curform[0].validform_ajax=$.ajax(ajaxsetup);
				}else{ //非ajax
					if(!settings.postonce){
						curform[0].validform_status="normal";
					}
					var url=url || settings.url;
					if(url){
						curform.attr("action",url);
					}
					settings.callback && settings.callback(curform);
					return true;
				}
			}
			return false;
		},
		
		resetForm:function(){
			var brothers=this;
			brothers.each(function(){
				this.reset && this.reset();
				this.validform_status="normal";
			});
			
			brothers.find(".Validform_right").text("");
			brothers.find(".passwordStrength").children().removeClass("bgStrength");
			brothers.find(".tip").removeClass("Validform_wrong Validform_right Validform_loading");
			brothers.find(".Validform_error").removeClass("Validform_error");
			brothers.find("[datatype]").removeData("cked").removeData("dataIgnore").each(function(){
				this.validform_lastval=null;
			});
			brothers.eq(0).find("input:first").focus();
		},
		
		abort:function(){
			if(this.validform_ajax){
				this.validform_ajax.abort();	
			}
		}
		
	}
	
	$.Datatype=Validform.util.dataType;
	
	Validform.prototype={
		dataType:Validform.util.dataType,
		
		eq:function(n){
			var obj=this;
			
			if(n>=obj.forms.length){
				return null;	
			}
			
			if(!(n in obj.objects)){
				obj.objects[n]=new Validform($(obj.forms[n]).get(),{},true);
			}
			
			return obj.objects[n];

		},
		
		resetStatus:function(){
			var obj=this;
			$(obj.forms).each(function(){
				this.validform_status="normal";	
			});
			
			return this;
		},
		
		setStatus:function(status){
			var obj=this;
			$(obj.forms).each(function(){
				this.validform_status=status || "posting";	
			});
			
			return this;
		},
		
		getStatus:function(){
			var obj=this;
			var status=$(obj.forms)[0].validform_status;
			
			return status;
		},
		
		ignore:function(selector){
			var obj=this;
			var selector=selector || "[datatype]"
			
			$(obj.forms).find(selector).each(function(){
				$(this).data("dataIgnore","dataIgnore").removeClass("Validform_error");
			});
			
			return this;
		},
		
		unignore:function(selector){
			var obj=this;
			var selector=selector || "[datatype]"
			
			$(obj.forms).find(selector).each(function(){
				$(this).removeData("dataIgnore");
			});
			
			return this;
		},
		
		addRule:function(rule){
			/*
				rule => [{
					ele:"#id",
					datatype:"*",
					errormsg:"出错提示文字！",
					nullmsg:"为空时的提示文字！",
					tip:"默认显示的提示文字",
					altercss:"gray",
					ignore:"ignore",
					ajaxurl:"valid.php",
					recheck:"password",
					plugin:"passwordStrength"
				},{},{},...]
			*/
			var obj=this;
			var rule=rule || [];
			
			for(var index=0; index<rule.length; index++){
				var o=$(obj.forms).find(rule[index].ele);
				for(var attr in rule[index]){
					attr !=="ele" && o.attr(attr,rule[index][attr]);
				}
			}
			
			$(obj.forms).each(function(){
				var $this=$(this);
				Validform.util.enhance.call($this,this.settings.tiptype,this.settings.usePlugin,this.settings.tipSweep,"addRule");
			});
			
			return this;
		},
		
		ajaxPost:function(flag,sync,url){
			var obj=this;
			
			$(obj.forms).each(function(){
				//创建pop box;
				if( this.settings.tiptype==1 || this.settings.tiptype==2 || this.settings.tiptype==3 ){
					creatMsgbox();
				}
				
				Validform.util.submitForm.call($(obj.forms[0]),this.settings,flag,url,"ajaxPost",sync);
			});
			
			return this;
		},
		
		submitForm:function(flag,url){
			/*flag===true时不做验证直接提交*/
			var obj=this;
			$(obj.forms).each(function(){
				var subflag=Validform.util.submitForm.call($(this),this.settings,flag,url);
				subflag === undef && (subflag=true);
				if(subflag===true){
					this.submit();
				}
			});
			return this;
		},
		
		resetForm:function(){
			var obj=this;
			Validform.util.resetForm.call($(obj.forms));
			return this;
		},
		
		abort:function(){
			var obj=this;
			$(obj.forms).each(function(){
				Validform.util.abort.call(this);
			});
			
			return this;
		},
		
		check:function(bool,selector){
			/*
				bool：传入true，只检测不显示提示信息;
			*/
			
			var selector=selector || "[datatype]",
				obj=this,
				curform=$(obj.forms),
				flag=true;
			
			curform.find(selector).each(function(){
				Validform.util.check.call(this,curform,"",bool) || (flag=false);
			});
			
			return flag;
		},
		
		config:function(setup){
		/*
			config={
				url:"ajaxpost.php",//指定了url后，数据会提交到这个地址;
				ajaxurl:{
					timeout:1000,
					...
				},
				ajaxpost:{
					timeout:1000,
					...
				}
			}
		*/
			var obj=this;
			setup=setup || {};
			$(obj.forms).each(function(){
				var $this=$(this);
				this.settings=$.extend(true,this.settings,setup);
				Validform.util.enhance.call($this,this.settings.tiptype,this.settings.usePlugin,this.settings.tipSweep);
			});
			
			return this;
		}
	}

	$.fn.Validform=function(settings){
		return new Validform(this,settings);
	};
	
	function setCenter(obj,time){
		var left=($(window).width()-obj.outerWidth())/2,
			top=($(window).height()-obj.outerHeight())/2,
			
		top=(document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop)+(top>0?top:0);

		obj.css({
			left:left
		}).animate({
			top : top
		},{ duration:time , queue:false });
	}
	
	function creatMsgbox(){
		return false;
		if($("#Validform_msg").length!==0){return false;}
		msgobj=$('<div id="Validform_msg"><div class="Validform_title">'+tipmsg.tit+'<a class="Validform_close" href="javascript:void(0);">&chi;</a></div><div class="Validform_info"></div><div class="iframe"><iframe frameborder="0" scrolling="no" height="100%" width="100%"></iframe></div></div>').appendTo("body");//提示信息框;
		msgobj.find("a.Validform_close").click(function(){
			msgobj.hide();
			msghidden=true;
			if(errorobj){
				errorobj.focus().addClass("Validform_error");
			}
			return false;
		}).focus(function(){this.blur();});

		$(window).bind("scroll resize",function(){
			!msghidden && setCenter(msgobj,400);
		});
	};
	
	//公用方法显示&关闭信息提示框;
	$.Showmsg=function(msg){
		creatMsgbox();
		Validform.util.showmsg.call(win,msg,1,{});
	};
	
	$.Hidemsg=function(){
		msgobj.hide();
		msghidden=true;
	};
	
})(jQuery,window);