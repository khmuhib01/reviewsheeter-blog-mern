const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			minlength: 5,
			maxlength: 200,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		content: {
			type: String,
			required: [true, 'Content is required'],
			minlength: 20,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', // Reference to the User model
			required: true,
		},
		image: {
			type: String,
			default: 'default.jpg', // Optional featured image
		},
		category: {
			type: String,
			required: true,
			enum: ['Technology', 'Health', 'Lifestyle', 'Finance', 'Travel', 'Food'],
		},
		tags: {
			type: [String], // Array of tags for SEO
			default: [],
		},
		likes: {
			type: Number,
			default: 0,
		},
		comments: [
			{
				user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
				comment: {type: String, required: true},
				createdAt: {type: Date, default: Date.now},
			},
		],
		isPublished: {
			type: Boolean,
			default: false,
		},
		publishedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true, // Adds `createdAt` and `updatedAt`
	}
);

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
