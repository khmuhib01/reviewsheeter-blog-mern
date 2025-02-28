import express from 'express';
import db from '../db.js';

const router = express.Router();

// CREATE Category
router.post('/', (req, res) => {
	const {name, description} = req.body;

	// Validate "name" field
	if (!name || name.trim() === '') {
		return res.status(400).json({error: 'Category name is required'});
	}
	if (name.length > 100) {
		return res.status(400).json({error: 'Category name must be 100 characters or less'});
	}

	// Insert into database
	const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
	db.query(sql, [name, description], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		res.status(201).json({id: result.insertId, name, description});
	});
});

// READ All Categories
router.get('/', (req, res) => {
	db.query('SELECT * FROM categories', (err, results) => {
		if (err) return res.status(500).json({error: err.message});
		res.json(results);
	});
});

// READ Single Category
router.get('/:id', (req, res) => {
	const {id} = req.params;
	db.query('SELECT * FROM categories WHERE id = ?', [id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length === 0) return res.status(404).json({message: 'Category not found'});
		res.json(result[0]);
	});
});

// UPDATE Category
router.put('/:id', (req, res) => {
	const {id} = req.params;
	const {name, description} = req.body;
	db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		res.json({message: 'Category updated successfully'});
	});
});

// DELETE Category
router.delete('/:id', (req, res) => {
	const {id} = req.params;
	db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		res.json({message: 'Category deleted successfully'});
	});
});

// Use ES module export
export default router;
