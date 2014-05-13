<?php
class CPager {
    /*
    * desc: 分页html生成,实现说明:
    *       1, 从第一页到最后一页生怕数了序列[array(1,2,3,4,5,6,.....n)];
    *       2, 将序列分成3段即可;
    *
    */
    static function Pager($page=1, $total=0, $pArr, $maxpage=30)  
    {
        $page  = intval($page);
        $total = intval($total);
        $limit = intval(isset($pArr['limit'])?$pArr['limit']:20);
        
        if(0 == $total) return '';

        $pages = intval(ceil(floatval($total)/floatval($limit)));
        $pages = 0==$pages?1:$pages;
        $pages = $pages>$maxpage?$maxpage:$pages;
        $url  = isset($pArr['url'])?$pArr['url']:1;


        $prev  = $page - 1;
        $next  = $page + 1;
        $prev  = $prev<1?1:$prev; // 1 if prev<1 else prev
        $next  = $next>$pages?$pages:$next; //pages if next>pages else next
        $numStart = $page - 3;
        $numEnd   = $page + 3;
        $numStart = $numStart<1?1:$numStart; //1 if numStart<1 else numStart
        $numEnd   = $numEnd>$pages?$pages:$numEnd; //pages if numEnd>pages else numEnd

        #附加参数
        // _kw = kw.copy()
        // if kw.has_key('page'):      del(kw['page'])
        // if kw.has_key('total'):     del(kw['total'])
        // if kw.has_key('url'):       del(kw['url'])
        // if kw.has_key('skeys'):     del(kw['skeys'])
        // if kw.has_key('staticize'): del(kw['staticize'])

        unset($pArr['url'],$pArr['limit'],$pArr['page']);


        foreach($pArr as $k=>$v){
            if(0 !== $v && empty($v)){
                unset($pArr[$k]);
            }
        }
        // for k,v in kw.items():
        //     if False == v or None == v or 'nPage' == k:
        //         del(kw[k])
        //         continue
        //     kw[k] = v.encode('utf-8') if isinstance(v, unicode) else v
        
        // query = '&'+urllib.urlencode(kw) if len(kw)>0 else ''
        if(!empty($pArr)){
            $query = '&' . http_build_query($pArr);
        }else{
            $query = '';
        }
        
       
        $seg01start = 1;
        $seg01end   = 1;
        $seg01end   = $seg01end>$pages?$pages:$seg01end; //pages if seg01end>pages else seg01end
        // $seg01arr   = array();//range(seg01start,seg01end+1)
        // for($i=$seg01start; $i<=$seg01end; $i++){
        //     $seg01arr[] = $i;
        // }
        $seg01arr = range($seg01start, $seg01end);
        
        $seg02start = $page-2;
        $seg02end   = $page+2;
        $seg02start = $page>$pages-2?$seg02start-2:$seg02start;// seg02start-2 if page>pages-2 else seg02start
        $seg02start = $seg02start<1?1:$seg02start; //1 if seg02start<1?1:$seg02start;<1 else seg02start
        $seg02end   = $page<3?$seg02end+2:$seg02end; //seg02end+2 if page<3 else seg02end
        $seg02end   = $seg02end>$pages?$pages:$seg02end; //pages if seg02end>pages else seg02end
        // $seg02arr   = array(); //range(seg02start, seg02end+1)
        // for($i=$seg02start; $i<=$seg02end; $i++){
        //     $seg02arr[] = $i;
        // }
        $seg02arr = range($seg02start, $seg02end);

        $seg03start = $pages;
        $seg03end   = $pages;
        $seg03start = $seg03start<1?1:$seg03start; //1 if seg03start<1 else seg03start
        $seg03end   = $seg03end>$pages?$pages:$seg03end; //pages if seg03end>pages else seg03end
        // $seg03arr   = array(); //range(seg03start, seg03end+1)
        // for($i=$seg03start; $i<=$seg03end; $i++){
        //     $seg03arr[] = $i;
        // }
        $seg03arr = range($seg03start, $seg03end);
        
        # print '-------------------------',pages, seg01arr , seg02arr , seg03arr
        $numArr = array_merge($seg01arr,$seg02arr,$seg03arr);
        // numArr     = seg01arr + seg02arr + seg03arr
        // numArr     = list(set(numArr))
        // numArr.sort()
        sort($numArr);
        $numArr = array_unique($numArr);
        // print_r($numArr);
        $numHtml  = '';
        $lastP    = -1;
        foreach($numArr as $p){
            if ($p-1 != $lastP && $lastP > 0)
                $numHtml .= '<span class="omit" >...</span>';
            if($page == $p)
                $numHtml .= sprintf('<a href="javascript:;" class="pnum pagesel">%s</a>', $p);
            else
                $numHtml .= sprintf('<a href="?page=%s%s" class="pnum">%s</a>', $p,$query, $p);
            $lastP = $p;
        }
        /*
        <div class="pages">
              <a class="nextp" href="">下一页</a>
              <span class="omit">…</span>
              <a class="pnum" href="">5</a>
              <a class="pnum" href="">4</a>
              <a class="pnum" href="">3</a>
              <a class="pnum" href="">2</a>
              <a class="pagesel" href="">1</a>
              <a class="lastp" href="">上一页</a>
            </div>*/
        /*$html = sprintf('
        <div class="pager">
              <a href="?page=%s%s" style="display:none;">首页</a><a  href="?page=%s%s">上一页</a>%s<a href="?page=%s%s">下一页</a><a href="?page=%s%s" style="display:none;">尾页</a> 
        </div>
        ', 1,$query, $prev,$query, $numHtml, $next,$query, $pages,$query);
        */
        $html = "<div class='pages'>
              <a href='?page=1{$query}' style='display:none;'>首页</a><a  href='?page=$prev{$query}' data-page='{$prev}' class='lnp lastp'>上一页</a>{$numHtml}<a href='?page=$next{$query}' data-page='{$next}' class='lnp nextp'>下一页</a><a href='?page=$pages{$query}' style='display:none;''>尾页</a> 
        </div>";
    
        return $html;
    }

    /*
    * 用正则提取上/下页
    *
    *
    *@pager --- str 完整的分页html
    *@cls1  --- str "上一页"的样式
    *@cls2  --- str "下一页"的样式
    *
    *
    */
    static function fetchMiniPager($pager, $cls1='hpsel', $cls2='opsel', $text1='&lt;', $text2='&gt;')
    {
        $minipager = '';
        //用正则提取上/下页
        preg_match("/<a[^<]*?lastp.*?>.*?<\/a>/usi", $pager, $pArr);
        if(isset($pArr[0])){
            $page_prev  = str_replace('上一页', $text1, $pArr[0]);
            // $page_prev  = str_replace('lastp', $cls1, $page_prev);
            $page_prev  = preg_replace("/class\=[\"\'].*?[\"\']/", "class='$cls1'", $page_prev);
            $minipager .= $page_prev;
        }
        preg_match("/<a[^<]*?nextp.*?>.*?<\/a>/usi", $pager, $pArr);
        if(isset($pArr[0])){
            $page_next  = str_replace('下一页', $text2, $pArr[0]);
            // $page_next  = str_replace('nextp', $cls2, $page_next);
            $page_next  = preg_replace("/class\=[\"\'].*?[\"\']/", "class='$cls2'", $page_next);
            $minipager .= $page_next;
        }
        //<a href="?page=2" class="nextp">下一页</a>
        //end 用正则提取上/下页
        return $minipager;
    }
};

