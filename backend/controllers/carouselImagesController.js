// backend/controllers/carouselImagesController.js
const pool = require('../config/db');


// 獲取所有輪播圖
exports.getAllCarouselImages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, url, visible, created_at FROM carousel_images WHERE visible = 1 ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: '伺服器錯誤', error: error.message });
  }
};

// 根據 ID 獲取單個輪播圖
exports.getCarouselImageById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM carousel_images WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '輪播圖未找到', error: error.message });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 新增輪播圖
exports.createCarouselImage = async (req, res) => {
  try {
    const imageUrl = `${req.file.filename}`;
    const [result] = await pool.query(
      'INSERT INTO carousel_images (url, created_at,visible) VALUES (?, NOW(),1)',
      [imageUrl]
    );
    
    // 取得新增的資料
    const [newImage] = await pool.query(
      'SELECT * FROM carousel_images WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newImage[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 更新輪播圖
exports.updateCarouselImage = async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body; // 支援 visible 欄位
  try {
    const [result] = await pool.query(
      'UPDATE carousel_images SET visible = ? WHERE id = ?',
      [visible, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '輪播圖未找到' });
    }
    res.json({ id, visible });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 刪除輪播圖
exports.deleteCarouselImage = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM carousel_images WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '輪播圖未找到', error: error.message });
    }
    res.json({ message: '輪播圖已成功刪除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};