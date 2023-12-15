const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");
const Post = require("../models/post");

exports.comments_get = async (req, res, bnext) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .exec();
    res.json(post.comments);
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
          { _id: req.params.id },
          { $push: { comments: comment } }
        );
        res.status(200).json({ message: "Comment created" });
      } catch (error) {
        return next(error);
      }
    }
  },
];
