import express from 'express';
import db from '../db.js';
import multer from 'multer';
import slugify from 'slugify';
import path from 'path';

const router = express.Router();

// 🖼 Setup Multer for Image Uploads
const storage = multer.diskStorage({
	destination: './uploads/',
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname)); // Rename file
	},
});

const upload = multer({storage});

/**
 * ✅ CREATE Post (POST /api/posts)
 */
router.post('/', upload.single('image'), (req, res) => {
	const {category_id, title, author, content} = req.body;
	const image = req.file ? `/uploads/${req.file.filename}` : null; // Save image URL

	// Validate input
	if (!category_id) return res.status(400).json({error: 'Category ID is required'});
	if (!title || title.trim() === '') return res.status(400).json({error: 'Title is required'});
	if (title.length > 200) return res.status(400).json({error: 'Title must be 200 characters or less'});
	if (!author || author.trim() === '') return res.status(400).json({error: 'Author is required'});
	if (!content || content.trim() === '') return res.status(400).json({error: 'Content is required'});

	// Generate slug from title
	const slug = slugify(title, {lower: true, strict: true});

	// Check if category exists
	db.query('SELECT * FROM categories WHERE id = ?', [category_id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length === 0) return res.status(404).json({error: 'Category not found'});

		// Insert the new post
		const sql = 'INSERT INTO posts (category_id, title, slug, author, content, image) VALUES (?, ?, ?, ?, ?, ?)';
		db.query(sql, [category_id, title, slug, author, content, image], (err, result) => {
			if (err) return res.status(500).json({error: err.message});
			res.status(201).json({id: result.insertId, category_id, title, slug, author, content, image});
		});
	});
});

/**
 * ✅ GET All Posts (GET /api/posts)
 * Supports: filtering by category_id, sorting, and pagination
 */
router.get('/', (req, res) => {
	let sql = 'SELECT p.*, c.name as category_name FROM posts p INNER JOIN categories c ON p.category_id = c.id';
	const queryParams = [];

	// Filter by category (e.g., ?category_id=1)
	if (req.query.category_id) {
		sql += ' WHERE p.category_id = ?';
		queryParams.push(req.query.category_id);
	}

	// Sorting (e.g., ?sort=desc)
	if (req.query.sort === 'asc' || req.query.sort === 'desc') {
		sql += ' ORDER BY p.created_at ' + req.query.sort;
	}

	// Pagination (e.g., ?limit=10&offset=5)
	if (req.query.limit) {
		sql += ' LIMIT ?';
		queryParams.push(parseInt(req.query.limit, 10));
	}
	if (req.query.offset) {
		sql += ' OFFSET ?';
		queryParams.push(parseInt(req.query.offset, 10));
	}

	db.query(sql, queryParams, (err, results) => {
		if (err) return res.status(500).json({error: err.message});
		res.json(results);
	});
});

/**
 * ✅ GET Single Post by Slug (GET /api/posts/:slug)
 */
router.get('/:slug', (req, res) => {
	const {slug} = req.params;

	const sql =
		'SELECT p.*, c.name as category_name FROM posts p INNER JOIN categories c ON p.category_id = c.id WHERE p.slug = ?';
	db.query(sql, [slug], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length === 0) return res.status(404).json({message: 'Post not found'});
		res.json(result[0]);
	});
});

/**
 * ✅ UPDATE Post by ID (PUT /api/posts/:id)
 */
router.put('/:id', upload.single('image'), (req, res) => {
	const {id} = req.params;
	const {category_id, title, author, content} = req.body;
	const image = req.file ? `/uploads/${req.file.filename}` : req.body.image; // Keep old image if not updated

	if (!title || title.trim() === '') return res.status(400).json({error: 'Title is required'});

	const slug = slugify(title, {lower: true, strict: true});

	const sql = 'UPDATE posts SET category_id = ?, title = ?, slug = ?, author = ?, content = ?, image = ? WHERE id = ?';
	db.query(sql, [category_id, title, slug, author, content, image, id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.affectedRows === 0) return res.status(404).json({message: 'Post not found'});
		res.json({message: 'Post updated successfully'});
	});
});

/**
 * ✅ DELETE Post by ID (DELETE /api/posts/:id)
 */
router.delete('/:id', (req, res) => {
	const {id} = req.params;

	db.query('DELETE FROM posts WHERE id = ?', [id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.affectedRows === 0) return res.status(404).json({message: 'Post not found'});
		res.json({message: 'Post deleted successfully'});
	});
});

export default router;
