import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import userRoutes from './routes/userRoute.js'; // Import user routes
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in JSON parser
app.use('/uploads', express.static('uploads')); // Serve static uploads

// Routes
app.use('/api/users', userRoutes); // User Authentication API
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
	console.log(`✅ Server running on port ${PORT}`);
});
