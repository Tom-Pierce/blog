const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");
const Post = require("../models/post");

exports.comments_get = async (req, res, bnext) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .exec();
    res.status(200).json(post.comments);
  } catch (error) {
    return next(error);
  }
};

exports.comments_post = [
  body("text", "Comment cannot be empty").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    if (req.user === undefined) {
      return res
        .status(403)
        .json({ message: "You must be logged in to comment" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.sendStatus(400).json({ errors: errors.array() });
    } else {
      try {
        const comment = new Comment({
          author: req.user._id,
          text: req.body.text,
        });
        await comment.save();
        await Post.updateOne(
          { _id: req.params.postId },
          { $push: { comments: comment } }
        );
        res.status(201).json({ message: "Comment created" });
      } catch (error) {
        return next(error);
      }
    }
  },
];
exports.comment_get = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId).exec();
    if (comment === null) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(comment);
  } catch (error) {}
};

exports.comment_delete = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(401)
        .json({ message: "Must be admin to delete comments" });
    }
    const result = await Comment.findByIdAndDelete(req.params.commentId).exec();
    if (result === null) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
