<?php
namespace Ht\Controller;
use Think\Controller;
class CouponsController extends PublicController{

	//***************************
	//说明：电子券管理页面
	//***************************
	public function index() {

		$keyword = trim($_REQUEST['keyword']);
		$where = '1=1';
		if ($keyword) {
			$where .=' AND title LIKE "%'.$keyword.'%"';
		}

		$shop_id = intval($_REQUEST['shop_id']);
		if ($shop_id) {
			$where .=' AND shop_id='.$shop_id;
		}

		define('rows',20);
		$count=M('coupons')->where($where)->count();
		$rows=ceil($count/rows);
		$page=(int)$_REQUEST['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$coupons_list = M('coupons')->where($where)->order('state desc')->limit($limit,rows)->select();
		$page_index=$this->page_index($count,$rows,$page);
		foreach ($coupons_list as $k => $v) {
			$coupons_list[$k]['sname'] = M('exshop')->where('id='.intval($v['shop_id']))->getField('name');
			$coupons_list[$k]['uname'] = M('user')->where('id='.intval($v['uid']))->getField('name');
			if ($v['gettime']>0) {
				$coupons_list[$k]['gettime'] = date("Y-m-d H:i",$v['gettime']);
			}
			if ($v['checktime']>0) {
				$coupons_list[$k]['checktime'] = date("Y-m-d H:i",$v['checktime']);
			}
			if ($v['offtime']>0) {
				$coupons_list[$k]['offtime'] = date("Y-m-d H:i",$v['offtime']);
				if ($v['offtime']<time() && intval($v['state'])==1) {
					M('coupons')->where('id='.intval($v['id']))->save(array('state'=>3));
					$coupons_list[$k]['state'] = 3;
				}
			}
		}

		$this->assign('shop_id',$shop_id);
		$this->assign('coupons_list',$coupons_list);
		$this->assign('page_index',$page_index);
		$this->display();
	}

	//********************************
	//说明：电子券 添加修改页面
	//********************************
	public function add(){
		$this->display();
	}

	//********************************
	//说明：电子券 添加
	//********************************
	public function save(){
		$title = $_REQUEST['title'];
		$oprice = floatval($_REQUEST['oprice']);
		$shop_id = intval($_REQUEST['shop_id']);
		$addtime = time();

		$count = intval($_REQUEST['count']);
		if ($count==0) {
			$this->error('请输入生成数量.'.__LINE__);
			exit();
		}

		if (!$oprice) {
			$this->error('请输入赠送最低订单金额.'.__LINE__);
			exit();
		}

		for ($i=0; $i < $count; $i++) { 
			$data = array();
			$data['shop_id'] = $shop_id;
			$data['title'] = $title;
			$data['oprice'] = $oprice;
			$data['addtime'] = $addtime;
			$data['ecode'] = $this->build_number();
			M('coupons')->add($data);
		}

		$this->success('操作成功！','index');
		exit();
	}

	//***************************
	//说明：电子券 删除
	//***************************
	public function del(){
		$id = intval($_REQUEST['did']);
		$check_info = M('coupons')->where('id='.intval($id))->find();
		if (!$check_info) {
			echo '<script>alert("参数错误.");history.go(-1);</script>';
			exit();
		}

		if (intval($check_info['state'])==1) {
			echo '<script>alert("电子券还未认证，不能删除！");history.go(-1);</script>';
			exit();
		}

		$up = M('coupons')->where('id='.intval($id))->delete();
		if ($up) {
			$this->redirect('Coupons/index', array('page' => $_REQUEST['page']));
			exit();
		}else{
			echo '<script>alert("操作失败.");history.go(-1);</script>';
		    exit;
		}
	}

	//***************************
	//说明：获取体验店
	//***************************
	public function get_exshop(){
		$where = '1=1 AND audit=1';
		//分页
		$count = M('exshop')->where($where)->count();// 查询满足要求的总记录数
		$Page  = new \Think\Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数(25)

		//头部描述信息，默认值 “共 %TOTAL_ROW% 条记录”
		$Page->setConfig('header', '<li class="rows">共<b>%TOTAL_ROW%</b>条&nbsp;第<b>%NOW_PAGE%</b>页/共<b>%TOTAL_PAGE%</b>页</li>');
		//上一页描述信息
	    $Page->setConfig('prev', '上一页');
	    //下一页描述信息
	    $Page->setConfig('next', '下一页');
	    //首页描述信息
	    $Page->setConfig('first', '首页');
	    //末页描述信息
	    $Page->setConfig('last', '末页');
	    /*
	    * 分页主题描述信息 
	    * %FIRST%  表示第一页的链接显示  
	    * %UP_PAGE%  表示上一页的链接显示   
	    * %LINK_PAGE%  表示分页的链接显示
	    * %DOWN_PAGE% 	表示下一页的链接显示
	    * %END%   表示最后一页的链接显示
	    */
	    $Page->setConfig('theme', '%FIRST%%UP_PAGE%%LINK_PAGE%%DOWN_PAGE%%END%%HEADER%');

		$show    = $Page->show();// 分页显示输出
		// 进行分页数据查询 注意limit方法的参数要使用Page类的属性
		$list = M('exshop')->where($where)->order('addtime desc')->limit($Page->firstRow.','.$Page->listRows)->select();
		foreach ($list as $k => $v) {
			$list[$k]['addtime'] = date("Y-m-d H:i",$v['addtime']);
			$list[$k]['u_name'] = M('user')->where('id='.intval($v['uid']))->getField('name');
		}
		//echo $where;
		$this->assign('list',$list);// 赋值数据集
		$this->assign('page',$show);// 赋值分页输出
		$this->display(); // 输出模板
	}

	/**针对涂屠生成唯一支付单号
	*@return int 返回16位的唯一支付单号
	*/
	public function build_number(){
		list($msec, $sec) = explode(' ', microtime());
		$msectime =  (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);

		return rand(10,99).substr($msectime,-4).rand(1000,9999);
	}

}