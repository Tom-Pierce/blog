const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const mongoose = require("mongoose");

// Get posts
exports.posts_get = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublished: true }, "-isPublished")
      .sort({ datePublished: -1 })
      .populate("author", "username")
      .exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(200).json("No posts found");
  }
};

// Create Post
exports.posts_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must have a title")
    .escape(),

  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Your post must have a text")
    .escape(),

  body("published").trim().isBoolean().escape(),

  async (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Must be admin to create a post" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const post = new Post({
        title: req.body.title,
        author: req.user._id,
        text: req.body.text,
        isPublished: req.body.published,
      });
      post.save();
      return res.status(201).json({ message: "Post created" });
    } catch (error) {
      return next(error);
    }
  },
];

// Get post by id
exports.post_get = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username")
      .exec();
    if (post === null) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.isPublished) {
      return res.status(200).json(post);
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    return next(error);
  }
};

exports.post_delete = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "Must be admin to delete posts" });
    }
    const result = await Post.findByIdAndDelete(req.params.postId).exec();
    if (result === null) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

exports.post_put = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .optional()
    .withMessage("You must have a title")
    .escape(),

  body("text")
    .trim()
    .optional()
    .isLength({ min: 1 })
    .withMessage("Your post must have a text")
    .escape(),

  body("published").trim().isBoolean().optional().escape(),

  async (req, res, next) => {
    try {
      if (!req.user.isAdmin) {
        return res
          .status(401)
          .json({ message: "Must be admin to update posts" });
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
        return res.status(404).json({ message: "Post not found" });
      }
      const result = await Post.findByIdAndUpdate(req.params.postId, {
        ...req.body,
      }).exec();
      if (result === null) {
        return res.status(404).json({ message: "Post not found" });
      }
      return res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  },
];
