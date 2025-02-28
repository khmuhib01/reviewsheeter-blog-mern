const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			trim: true,
		},
		parentCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			default: null, // For subcategories
		},
		image: {
			type: String, // URL or path to the category image
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt timestamps
	}
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
