const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    res.status(201).json({ message: 'Category created', categoryId: result.insertId });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );

    res.json({ message: 'Category updated' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};