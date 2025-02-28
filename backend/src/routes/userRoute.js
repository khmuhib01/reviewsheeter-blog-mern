import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {protect} from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * ✅ Register User (POST /api/users/register)
 */
router.post('/register', async (req, res) => {
	const {name, email, password} = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({error: 'All fields are required'});
	}

	db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length > 0) return res.status(400).json({error: 'User already exists'});

		const hashedPassword = await bcrypt.hash(password, 10);
		db.query(
			'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
			[name, email, hashedPassword],
			(err, result) => {
				if (err) return res.status(500).json({error: err.message});

				const token = jwt.sign({id: result.insertId, email}, JWT_SECRET, {expiresIn: '1h'});

				// Store token in database
				db.query('UPDATE users SET token = ? WHERE id = ?', [token, result.insertId]);

				res.status(201).json({
					message: 'User registered successfully',
					token,
					user: {id: result.insertId, name, email},
				});
			}
		);
	});
});

/**
 * ✅ Login User (POST /api/users/login)
 */
router.post('/login', (req, res) => {
	const {email, password} = req.body;

	if (!email || !password) {
		return res.status(400).json({error: 'Email and password are required'});
	}

	db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length === 0) return res.status(401).json({error: 'Invalid email or password'});

		const user = result[0];
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(401).json({error: 'Invalid email or password'});

		const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '1h'});

		// Store token in database
		db.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

		res.json({
			message: 'Login successful',
			token,
			user: {id: user.id, name: user.name, email: user.email},
		});
	});
});

/**
 * ✅ Logout User (POST /api/users/logout)
 */
router.post('/logout', protect, (req, res) => {
	db.query('UPDATE users SET token = NULL WHERE id = ?', [req.user.id], (err) => {
		if (err) return res.status(500).json({error: err.message});
		res.json({message: 'Logout successful'});
	});
});

/**
 * ✅ Get User Profile (Protected Route) (GET /api/users/profile)
 */
router.get('/profile', protect, (req, res) => {
	db.query('SELECT id, name, email, token FROM users WHERE id = ?', [req.user.id], (err, result) => {
		if (err) return res.status(500).json({error: err.message});
		if (result.length === 0) return res.status(404).json({error: 'User not found'});
		res.json(result[0]);
	});
});

export default router;
