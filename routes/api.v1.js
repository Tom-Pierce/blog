const express = require("express");
const router = express.Router();

const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const authController = require("../controllers/authController");

router.get("/posts", postsController.posts_get);

router.post("/posts", postsController.posts_post);

router.get("/posts/:postId", postsController.post_get);

router.delete("/posts/:postId", postsController.post_delete);

router.put("/posts/:postId", postsController.post_put);

router.get("/posts/:postId/comments", commentsController.comments_get);

router.post("/posts/:postId/comments", commentsController.comments_post);

router.get(
  "/posts/:postId/comments/:commentId",
  commentsController.comment_get
);

router.delete(
  "/posts/:postId/comments/:commentId",
  commentsController.comment_delete
);

router.post("/signup", authController.sign_up);

router.post("/login", authController.log_in);

router.post("/adminlogin", authController.admin_log_in);

module.exports = router;
