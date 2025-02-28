import mysql from 'mysql2';
import 'dotenv/config';

const db = mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'blog',
});

db.connect((err) => {
	if (err) {
		console.error('Database connection failed:', err);
	} else {
		console.log('✅ MySQL Database connected');

		// Create categories table
		db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

		// Create posts table
		db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                author VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);

		// Create users table with token column
		db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                token TEXT,  -- ✅ Add token column
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

		// Check if token column exists, add it if missing
		db.query("SHOW COLUMNS FROM users LIKE 'token'", (err, result) => {
			if (err) console.error("❌ Error checking 'token' column:", err);
			if (result.length === 0) {
				db.query('ALTER TABLE users ADD COLUMN token TEXT', (err) => {
					if (err) console.error("❌ Error adding 'token' column:", err);
					else console.log("✅ 'token' column added to users table");
				});
			}
		});
	}
});

export default db;
