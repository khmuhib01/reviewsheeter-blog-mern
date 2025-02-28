import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const protect = (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(token, JWT_SECRET);
			req.user = decoded;
			next();
		} catch (error) {
			return res.status(401).json({error: 'Not authorized, token failed'});
		}
	}

	if (!token) {
		return res.status(401).json({error: 'Not authorized, no token'});
	}
};
