const BlogPost = require('../model/BlogPost');

// 📌 Create a new blog post
exports.createPost = async (req, res) => {
	try {
		const {title, slug, content, author, category, image, tags, isPublished} = req.body;

		// Create new blog post
		const newPost = new BlogPost({
			title,
			slug,
			content,
			author,
			category,
			image: image || 'default.jpg',
			tags,
			isPublished,
			publishedAt: isPublished ? new Date() : null,
		});

		await newPost.save();
		res.status(201).json({success: true, message: 'Blog post created', data: newPost});
	} catch (error) {
		res.status(500).json({success: false, message: 'Server Error', error: error.message});
	}
};

// 📌 Get all blog posts
exports.getAllPosts = async (req, res) => {
	try {
		const posts = await BlogPost.find().populate('author', 'name email');
		res.status(200).json({success: true, data: posts});
	} catch (error) {
		res.status(500).json({success: false, message: 'Server Error', error: error.message});
	}
};

// 📌 Get a single blog post by ID
exports.getPostById = async (req, res) => {
	try {
		const post = await BlogPost.findById(req.params.id).populate('author', 'name email');

		if (!post) {
			return res.status(404).json({success: false, message: 'Post not found'});
		}

		res.status(200).json({success: true, data: post});
	} catch (error) {
		res.status(500).json({success: false, message: 'Server Error', error: error.message});
	}
};

// 📌 Update a blog post
exports.updatePost = async (req, res) => {
	try {
		const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {new: true});

		if (!updatedPost) {
			return res.status(404).json({success: false, message: 'Post not found'});
		}

		res.status(200).json({success: true, message: 'Blog post updated', data: updatedPost});
	} catch (error) {
		res.status(500).json({success: false, message: 'Server Error', error: error.message});
	}
};

// 📌 Delete a blog post
exports.deletePost = async (req, res) => {
	try {
		const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);

		if (!deletedPost) {
			return res.status(404).json({success: false, message: 'Post not found'});
		}

		res.status(200).json({success: true, message: 'Blog post deleted'});
	} catch (error) {
		res.status(500).json({success: false, message: 'Server Error', error: error.message});
	}
};
