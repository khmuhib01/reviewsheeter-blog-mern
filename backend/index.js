require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const blogRoutes = require('./src/routes/BlogRoutes'); // ✅ Import routes

const app = express();
const port = process.env.PORT || 5000;

// Use JSON middleware for handling requests
app.use(express.json());

// MongoDB Connection
const userName = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASS);
const dbName = process.env.DB_NAME;
const mongoURI = `mongodb+srv://${userName}:${password}@reviewsheeter.yryox.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=reviewsheeter`;

console.log('🔄 Connecting to MongoDB...');

async function connectDB() {
	try {
		console.log('🔄 Attempting to connect to MongoDB Atlas...');
		await mongoose.connect(mongoURI);
		console.log('✅ Successfully connected to MongoDB!');

		// Start the server only after MongoDB is connected
		app.listen(port, () => {
			console.log(`🚀 Server running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		process.exit(1);
	}
}

// 🔹 Register API Routes
app.use('/api/blogs', blogRoutes); // ✅ This ensures `/api/blogs` works

// 🔹 Root Route
app.get('/', (req, res) => {
	res.send('Hello, API is running 🚀');
});

// 🔹 Start MongoDB Connection
connectDB();
