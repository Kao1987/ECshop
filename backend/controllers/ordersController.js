// backend/controllers/ordersController.js
const { pool } = require('../config/db');

// 獲取所有訂單
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.query.userId;
    let orderQuery = 'SELECT * FROM orders';
    let ordersParams = [];
    
    if(userId){
      orderQuery += ' WHERE user_id = ?';
      ordersParams.push(userId);
    }

    const [orders] = await pool.query(orderQuery, ordersParams);
    // 為每個訂單查詢訂單項目
    for(let order of orders){
      const [items] = await pool.query(`
        SELECT  oi.*,p.name AS product_name, p.image AS product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE order_id = ?
        `,[order.id]);
      order.items = items;
      if (order.order_date) {
        order.order_date = new Date(order.order_date).toLocaleString('zh-Tw',{
          timeZone:'Asia/Taipei',
          hour12:false,
        });
      }

      order.total = Math.round(order.total);
      order.items.forEach(item =>{
        item.price = Math.round(item.price);
      })
    }
    res.json({data:orders});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

// 根據 ID 獲取單個訂單
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ message: '訂單未找到' });
    }
    const order = orderRows[0];
    const[itemRows] = await pool.query(`
      SELECT  oi.*, p.name AS product_name, p.image AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,[id]);

      order.order_date = new Date(order.order_date).toLocaleString('zh-TW',{
        year:'numeric',
        month:'2-digit',
        day:'2-digit',
        hour:'2-digit',
        minute:'2-digit'
      })

      order.total = Math.round(order.total);
      itemRows.forEach(item=>{
        item.price = Math.round(item.price);
      });

    res.json({...order,items:itemRows});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

// 新增訂單
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try{
    await connection.beginTransaction();

    const  {user_id, items, total} = req.body;
    // 插入訂單表
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, status, order_date) VALUES (?, ?, ?,NOW())',
      [user_id,total,'pending']);
    const orderId = orderResult.insertId;
    // 構建orderItemData
    const orderItemsData = items.map( item => [orderId,item.product_id,item.quantity,item.price]);
    // 生成佔位符和展平數據
    const placeholders = orderItemsData.map(()=> '(?,?,?,?)').join(', ');
    const flatData = orderItemsData.flat();
    
    const sql = `INSERT INTO order_items (order_id,product_id,quantity, price) VALUES ${placeholders}`;
    await connection.query(sql,flatData);
      for(const item of items){
        await connection.query(
        'INSERT INTO sales (product_id, quantity_sold, total_amount, sale_date, customer_id) VALUES (?, ?, ?, NOW(), ?)',
        [
          item.product_id,
          item.quantity,
          item.quantity * item.price,
          user_id
        ]
      );
    }
    await connection.commit();

    res.status(201).json({message:'訂單創建成功',orderId});
  }catch (error) {
    await connection.rollback();
    console.error('創建訂單時出錯',error);
    res.status(500).json({ message: '伺服器錯誤' });
  }finally{
    connection.release();
  }
};

// 更新訂單
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if(!id || !status){
    return res.status(400).json({
      success: false,
      message: '訂單ID和狀態是必須的'
    });
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  if(!validStatuses.includes(status)){
    return res.status(400).json({
      success: false,
      message: '無效的訂單狀態'
    });
  }

  try {
    const [orders] = await pool.query(
      'SELECT id,status FROM orders WHERE id = ?', [id]);

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '訂單未找到' 
      });
    }

    const [result] = await pool.query(
      'UPDATE orders Set status = ? WHERE id = ?',
      [status, id]
    );

    if(result.affectedRows > 0){
      const [updatedOrder] = await pool.query(
        'SELECT id,status,updated_at FROM orders WHERE id = ?',
        [id]
      );
      return res.json({ 
        success: true,
        message: '訂單狀態已更新',
        data:updatedOrder[0]
      });
    }
    throw new Error('訂單狀態更新失敗');
  } catch (error) {
    console.error('更新訂單狀態時出錯',error);
    return res.status(500).json({ 
      success: false,
      message: '伺服器錯誤',
      error: error.message
    });
  }
};

// 更新訂單狀態
exports.updateOrderStatus = async (req, res) =>{
  const { id } = req.params;
  const {status} = req.body;
  try{
    const [orderExists] = await pool.query('SELECT id FROM orders WHERE id = ?',[id]);
    if(orderExists.length === 0){
      return res.status(404).json({ 
        success: false,
        message: '訂單未找到' 
      });
    }
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',[status, id]);
    if(result.affectedRows > 0){
      res.json({ 
        success: true,
        id,
        status,
        message: '訂單狀態已更新' 
      });
    }else{
      throw new Error('訂單狀態更新失敗');
    }
  }catch (error) {
    console.error('更新訂單狀態時出錯:', error);
    res.status(500).json({ 
      success: false,
      message: '伺服器錯誤，更新訂單失敗',
      error: error.message 
    });
  }
};

// 刪除訂單
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '訂單未找到' });
    }
    res.json({ message: '訂單已成功刪除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};
