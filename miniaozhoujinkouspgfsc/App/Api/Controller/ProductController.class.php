<?php
// 本类由系统自动生成，仅供测试用途
namespace Api\Controller;
use Think\Controller;
class ProductController extends PublicController {
	//***************************
	//  获取商品详情信息接口
	//***************************
    public function index(){
		$product=M("product");

		$pro_id = intval($_REQUEST['pro_id']);
		if (!$pro_id) {
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'));
			exit();
		}
		
		$pro = $product->where('id='.intval($pro_id).' AND del=0 AND is_down=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'.__LINE__));
			exit();
		}

		$pro['photo_x'] =__DATAURL__.$pro['photo_x'];
		$pro['photo_d'] = __DATAURL__.$pro['photo_d'];
		$pro['brand'] = M('brand')->where('id='.intval($pro['brand_id']))->getField('name');
		$pro['cat_name'] = M('category')->where('id='.intval($pro['cid']))->getField('name');
		$pro['shouhou'] = '卖家提供售后服务';
		$pro['canshulist'] = array();

		//图片轮播数组
		$img=explode(',',trim($pro['photo_string'],','));
		$b=array();
		if ($pro['photo_string']) {
			foreach ($img as $k => $v) {
				$b[] = __DATAURL__.$v;
			}
		}else{
			$b[] = $pro['photo_d'];
		}
		$pro['img_arr']=$b;//图片轮播数组
		
		//处理产品属性
		$gglist = array();$gglist2 = array();
		if(intval($pro['is_buff'])>0) { //如果产品属性有值才进行数据组装
			$pro_buff = M('attribute')->where('pro_id='.intval($pro_id))->field('id')->select();
			$gglist = M('guige')->where('pid='.intval($pro_id).' AND attr_id='.intval($pro_buff[0]['id']))->select();
			foreach ($gglist as $key => $val) {
				$gglist[$key]['num'] = 0;
			}
			if (count($pro_buff)==2) {
				$gglist2 = M('guige')->where('pid='.intval($pro_id).' AND attr_id='.intval($pro_buff[1]['id']))->select();
				foreach ($gglist2 as $k => $v) {
					//两个属性价格，取大的
					if (floatval($v['price'])<floatval($gglist[0]['price'])) {
						$gglist2[$k]['price'] = sprintf('%.2f',$gglist[0]['price']);
					}
					//两个属性库存，取少的
					if (intval($v['stock'])>intval($gglist[0]['stock'])) {
						$gglist2[$k]['stock'] = intval($gglist[0]['stock']);
					}
					$gglist2[$k]['num'] = 0;
				}
			}
			
		}

		$content = str_replace(C('content.dir'), __DATAURL__, $pro['content']);
		$pro['content']=html_entity_decode($content, ENT_QUOTES ,'utf-8');

		//检测产品是否收藏
		$col = M('product_sc')->where('uid='.intval($_REQUEST['uid']).' AND pid='.intval($pro_id))->getField('id');
		if ($col) {
			$pro['collect']= 1;
		}else{
			$pro['collect']= 0;
		}
		echo json_encode(array('status'=>1,'pro'=>$pro,'gglist'=>$gglist,'attrlist'=>$gglist2));
		exit();

	}

	//***************************
	//  获取商品详情接口
	//***************************
	public function details(){
		header('Content-type:text/html; Charset=utf8');
		$pro_id = intval($_REQUEST['pro_id']);
		$pro = M('product')->where('id='.intval($pro_id).' AND del=0 AND is_down=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'));
			exit();
		}
		//$content = preg_replace("/width:.+?[\d]+px;/",'',$pro['content']);
		$content = htmlspecialchars_decode($pro['content']);
		echo json_encode(array('status'=>1,'content'=>$content));
		exit();
	}


	//***************************
	//  获取商品属性接口
	//***************************
	public function getattrdata(){
		$pro_id = intval($_POST['pro_id']);
		$ggid = intval($_POST['ggid']);
		if (!$pro_id || !$ggid) {
			echo json_encode(array('status'=>0,'err'=>'参数错误！'.__LINE__));
			exit();
		}

		$pro = M('product')->where('id='.intval($pro_id).' AND del=0 AND is_down=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'.__LINE__));
			exit();
		}

		//处理产品属性
		$gglist = array();$gglist2 = array();
		if(intval($ggid)>0) { //如果产品属性有值才进行数据组装
			$gglist = M('guige')->where('pid='.intval($pro_id).' AND id='.intval($ggid))->find();
			$pro_buff = M('attribute')->where('pro_id='.intval($pro_id).' AND id!='.intval($gglist['attr_id']))->getField('id');
			if (intval($pro_buff)) {
				$gglist2 = M('guige')->where('pid='.intval($pro_id).' AND attr_id='.intval($pro_buff))->select();
				foreach ($gglist2 as $k => $v) {
					//两个属性价格，取大的
					if (floatval($v['price'])<floatval($gglist['price'])) {
						$gglist2[$k]['price'] = sprintf('%.2f',$gglist['price']);
					}
					//两个属性库存，取少的
					if (intval($v['stock'])>intval($gglist['stock'])) {
						$gglist2[$k]['stock'] = intval($gglist['stock']);
					}
					$gglist2[$k]['num'] = 0;
				}
			}
		}
		echo json_encode(array('status'=>1,'list'=>$gglist2));
		exit();
	}

	//***************************
	//  获取 商品列表接口
	//***************************
   	public function getlists(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$type=I('post.type');//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		$keyword=I('post.keyword');
 		//排序
 		$order="addtime desc";//默认按添加时间排序
 		//条件
 		$where="1=1 AND pro_type=1 AND del=0";
 		if(intval($id)){
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND catid IN (".$arrstr.")";
 			}else{
 				$where.=" AND catid=".intval($id);
 			}
 		}
 		$cid = intval($_REQUEST['cid']);
 		if ($cid) {
 			$where.=" AND cid=".intval($cid);
 		}
 		if (intval($brand_id)) {
 			$where.=" AND brand_id=".intval($brand_id);
 		}
 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}

 		//获取所有该分类下的三级分类
 		$clist = M('category')->where('tid='.intval($id))->field('id,name')->select();

 		echo json_encode(array('status'=>1,'pro'=>$json_arr,'clist'=>$clist));
 		exit();
    }

    //***************************
	//  获取 商品列表接口
	//***************************
   	public function getlist_more(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$type=I('post.type');//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		$keyword=I('post.keyword');
 		//排序
 		$order="addtime desc";//默认按添加时间排序
 		//条件
 		$where="1=1 AND pro_type=1 AND del=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND catid IN (".$arrstr.")";
 			}else{
 				$where.=" AND catid=".intval($id);
 			}
 		}
 		
 		$cid = intval($_REQUEST['cid']);
 		if ($cid) {
 			$where.=" AND cid=".intval($cid);
 		}

 		if (intval($brand_id)) {
 			$where.=" AND brand_id=".intval($brand_id);
 		}
 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}

 		echo json_encode(array('status'=>1,'pro'=>$json_arr));
 		exit();
    }

	//***************************
	//  获取 预售商品列表接口
	//***************************
   	public function lists(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$type=I('post.orders');//排序类型

 		$page= intval($_POST['page']) ? intval($_POST['page']) : 0;
 		$keyword=I('post.keyword');
 		//排序
 		$order="sort desc,shiyong desc,addtime asc";//默认按添加时间排序
 		if($type=='dsale'){
 			//销量降序
 			$order="shiyong desc";
 		}elseif($type=='asale'){
 			//销量升序
 			$order="shiyong asc";
 		}elseif($type=='aprice'){
 			//价格升序
 			$order="yu_price asc";
 		}elseif($type=='dprice'){
 			//价格降序
 			$order="yu_price desc";
 		}elseif($type=='atime'){
 			//时间降序
 			$order="addtime desc";
 		}
 		//条件
 		$where="1=1 AND pro_type=2 AND del=0 AND is_down=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND catid IN (".$arrstr.")";
 			}else{
 				$where.=" AND catid=".intval($id);
 			}
 		}

 		$cid = intval($_REQUEST['cid']);
 		if ($cid) {
 			$where.=" AND cid=".intval($cid);
 		}

 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($page.',8')->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['yu_price']=$v['yu_price'];
 			$json['yu_num']=$v['yu_num'];
 			$json['shiyong']=$v['shiyong'];
 			$json['company']=$v['company'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}
 		$cat_name=M('category')->where("id=".intval($id))->getField('name');
 		echo json_encode(array('status'=>1,'pro'=>$json_arr,'cat_name'=>$cat_name));
 		exit();
    }

    //*******************************
	//  商品列表页面 获取更多接口
	//*******************************
    public function get_more(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$type=I('post.orders');//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		$keyword=I('post.keyword');
 		//排序
 		$order="sort desc,shiyong desc,addtime asc";//默认按添加时间排序
 		if($type=='dsale'){
 			//销量降序
 			$order="shiyong desc";
 		}elseif($type=='asale'){
 			//销量升序
 			$order="shiyong asc";
 		}elseif($type=='aprice'){
 			//价格升序
 			$order="yu_price asc";
 		}elseif($type=='dprice'){
 			//价格降序
 			$order="yu_price desc";
 		}elseif($type=='atime'){
 			//时间降序
 			$order="addtime desc";
 		}
 		//条件
 		$where="1=1 AND pro_type=2 AND del=0 AND is_down=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND catid IN (".$arrstr.")";
 			}else{
 				$where.=" AND catid=".intval($id);
 			}
 		}

 		$cid = intval($_REQUEST['cid']);
 		if ($cid) {
 			$where.=" AND cid=".intval($cid);
 		}

 		if($keyword) {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price']=$v['price'];
 			$json['price_yh']=$v['price_yh'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}
 		$cat_name=M('category')->where("id=".intval($id))->getField('name');
 		echo json_encode(array('pro'=>$json_arr,'cat_name'=>$cat_name));
 		exit();
    }

    //***************************
	//  获取 预售商品列表接口
	//***************************
   	public function pifa_list(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid
 		// $id=44;
 		$atype=$_REQUEST['atype'];//排序类型
 		$ptype=$_REQUEST['ptype'];//排序类型

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*8)-8;

 		//排序
 		$order="";//默认按添加时间排序
 		if($atype && $atype=='gao'){
 			$order.="pifa_price desc";
 		}elseif($atype && $atype=='di'){
 			$order.="pifa_price asc";
 		}

 		if($ptype && $ptype=='old'){
 			if ($order!='') {
 				$order.=",addtime asc";
 			}else{
 				$order.="addtime asc";
 			}
 		}elseif($ptype && $ptype=='news'){
 			if ($order!='') {
 				$order.=",addtime desc";
 			}else{
 				$order.="addtime desc";
 			}
 		}

 		if ($order=='') {
 			$order="addtime desc";
 		}
 		//条件
 		$where="1=1 AND pro_type=3 AND del=0";
 		if(intval($id)){
 			//判断是不是一级分类，是则查询该分类下的所有二级分类id
 			$tid = M('category')->where('id='.intval($id))->field('id,tid')->find();
 			if (intval($tid['tid'])==1) {
 				$ids = M('category')->where('tid='.intval($tid['id']))->field('id')->select();
 				$arr = array();
 				foreach ($ids as $k => $v) {
 					$arr[] = $v['id'];
 				}
 				$arrstr = implode($arr, ',');
 				$where.=" AND catid IN (".$arrstr.")";
 			}else{
 				$where.=" AND catid=".intval($id);
 			}
 		}

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['pifa_num']=$v['pifa_num'];
 			$json['pifa_price']=$v['pifa_price'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}

 		//获取所有采购商品的分类
 		$product = M('product')->where('pro_type=3')->field('catid')->group('catid')->select();
 		$arrID = array();$arrIDs = array();
 		foreach ($product as $k => $v) {
 			$arrID['id'] = $v['catid'];
 			$arrID['name'] = M('category')->where('id='.intval($v['catid']))->getField('name');
 			$arrIDs[] = $arrID;
 		}

 		//价格高低排序
 		$prices = array();
 		$prices[0]['ptype'] = 'gao';
 		$prices[0]['name'] = '由高到底';
 		$prices[1]['ptype'] = 'di';
 		$prices[1]['name'] = '由底到高';

 		//根据时间排序
 		$times = array();
 		$times[0]['ptype'] = 'news';
 		$times[0]['name'] = '最新发布';
 		$times[1]['ptype'] = 'old';
 		$times[1]['name'] = '最近更新';

 		echo json_encode(array('status'=>1,'pro'=>$json_arr,'clist'=>$arrIDs,'price'=>$prices,'times'=>$times));
 		exit();
    }

    //***************************
	//  获取 体验商品列表接口
	//***************************
   	public function ti_list() {
 		$json="";
 		$page= intval($_REQUEST['page']);
 		if (!$page) {
 			$page = 1;
 		}
 		$limit = intval($page*10)-10;

 		//排序
 		$order="addtime desc";//默认按添加时间排序

 		//条件
 		$where="1=1 AND pro_type=4 AND del=0";
 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['price_yh']=$v['price_yh'];
 			$json['price']=$v['price'];
 			$json['shiyong']=$v['shiyong'];
 			$json['intro']=$v['intro'];
 			$json_arr[] = $json;
 		}

 		echo json_encode(array('status'=>1,'pro'=>$json_arr));
 		exit();
    }

	//***************************
	//  会员商品收藏接口
	//***************************
	public function col(){
		$uid = intval($_REQUEST['uid']);
		$pid = intval($_REQUEST['pid']);
		if (!$uid || !$pid) {
			echo json_encode(array('status'=>0,'err'=>'系统错误，请稍后再试.'));
			exit();
		}

		$check = M('product_sc')->where('uid='.intval($uid).' AND pid='.intval($pid))->getField('id');
		if ($check) {
			$res = M('product_sc')->where('id='.intval($check))->delete();
		}else{
			$data = array();
			$data['uid'] = intval($uid);
			$data['pid'] = intval($pid);
			$res = M('product_sc')->add($data);
		}
		
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>'网络错误..'));
			exit();
		}
	}


}