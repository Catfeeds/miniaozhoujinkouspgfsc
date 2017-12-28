<?php
namespace Api\Controller;
use Think\Controller;
class IndexController extends PublicController {
	//***************************
	//  首页数据接口
	//***************************
    public function index(){
    	/***********获取首页顶部轮播图************/
    	$ggtop=M('guanggao')->order('sort asc,id desc')->field('id,photo,type,action')->limit(10)->select();
		foreach ($ggtop as $k => $v) {
			$ggtop[$k]['photo']=__DATAURL__.$v['photo'];
		}
    	/***********获取首页顶部轮播图 end************/

        //======================
        //首页推荐商家12个
        //======================
        $shop = M('shangchang')->where('status=1 AND type=1')->field('id,logo')->limit(12)->select();
        foreach ($shop as $k => $v) {
            $shop[$k]['logo'] = __DATAURL__.$v['logo'];
        }

    	//======================
    	//首页推荐 普通产品
    	//======================
    	// $pro_list = M('product')->where('del=0 AND is_down=0 AND type=1')->order('sort asc,addtime desc')->field('id,photo_x')->limit(6)->select();
        $pro_tj = M('pro_tj')->where('type=1')->select();
        $pro_list = array();
        foreach($pro_tj as $k => $v){
            //$pro_id = explode(',',trim($v['pid'],','));
            $pro_list[$k] = M('product')->where('id IN ('.trim($v['pid'],',').')')->limit(30)->select(); 
            foreach($pro_list[$k] as $k2 => $v2){
                $pro_list[$k][$k2]['photo_x'] = __DATAURL__.$v2['photo_x'];
                $pro_list[$k][$k2]['title'] = $v['name'];
            }
        }
       
        $pro_list = self::array2object($pro_list);
        //======================
        //首页分类
        //======================
        $cat = M('indeximg')->where('1=1 AND link="other"')->order('sort asc')->field('name,photo,ptype')->select();
        foreach ($cat as $k => $v) {
            $cat[$k]['photo'] = __DATAURL__.$v['photo'];
        }
        $cat2 = M('indeximg')->where('1=1 AND link="list"')->order('sort asc')->field('id,name,photo,ptype')->select();
        foreach ($cat2 as $k => $v) {
            $cat2[$k]['photo'] = __DATAURL__.$v['photo'];
        }

        $uid = intval($_REQUEST['uid']);
        $info = M('exshop')->where('uid='.intval($uid).' AND audit=1')->getField('id');
        if (intval($info)>0) {
            $authtype = 1;
        }else{
            $authtype = 0;
        }

    	echo json_encode(array('ggtop'=>$ggtop,'prolist'=>$pro_list,'shop'=>$shop,'first'=>$cat,'authtype'=>$authtype,'list'=>$cat2));
    	exit();
    }

    //***************************
    //  首页产品 分页
    //***************************
    public function getlist(){
        $page = intval($_REQUEST['page']);
        $limit = intval($page*8)-8;

        $pro_list = M('product')->where('del=0 AND pro_type=1 AND is_down=0 AND type=1')->order('sort desc,id desc')->field('id,name,photo_x,price_yh,shiyong')->limit($limit.',8')->select();
        foreach ($pro_list as $k => $v) {
            $pro_list[$k]['photo_x'] = __DATAURL__.$v['photo_x'];
        }

        echo json_encode(array('prolist'=>$pro_list));
        exit();
    }

    public function getcode(){
        $str = null;
        $strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        $max = strlen($strPol)-1;

        for($i=0;$i<32;$i++){
            $str.=$strPol[rand(0,$max)];//rand($min,$max)生成介于min和max两个数之间的一个随机整数
        }

        echo json_encode(array('status'=>'OK','code'=>$str));
        exit();
    }

    public static function array2object($d)
    {
        if (is_array($d))
            return (object) array_map('self::array2object', $d);
        else
            return $d;
    }


}