const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
	try {
		const {name, description, parentCategory, image, status} = req.body;

		// Check if the category name already exists
		const existingCategory = await Category.findOne({name});
		if (existingCategory) {
			return res.status(400).json({message: 'Category already exists'});
		}

		const category = new Category({name, description, parentCategory, image, status});
		await category.save();

		res.status(201).json({message: 'Category created successfully', category});
	} catch (error) {
		res.status(500).json({message: 'Server error', error});
	}
};

// Get all categories
exports.getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find().populate('parentCategory');
		res.status(200).json(categories);
	} catch (error) {
		res.status(500).json({message: 'Server error', error});
	}
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id).populate('parentCategory');

		if (!category) {
			return res.status(404).json({message: 'Category not found'});
		}

		res.status(200).json(category);
	} catch (error) {
		res.status(500).json({message: 'Server error', error});
	}
};

// Update a category
exports.updateCategory = async (req, res) => {
	try {
		const {name, description, parentCategory, image, status} = req.body;

		const updatedCategory = await Category.findByIdAndUpdate(
			req.params.id,
			{name, description, parentCategory, image, status},
			{new: true, runValidators: true}
		);

		if (!updatedCategory) {
			return res.status(404).json({message: 'Category not found'});
		}

		res.status(200).json({message: 'Category updated successfully', updatedCategory});
	} catch (error) {
		res.status(500).json({message: 'Server error', error});
	}
};

// Delete a category
exports.deleteCategory = async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);

		if (!category) {
			return res.status(404).json({message: 'Category not found'});
		}

		res.status(200).json({message: 'Category deleted successfully'});
	} catch (error) {
		res.status(500).json({message: 'Server error', error});
	}
};
