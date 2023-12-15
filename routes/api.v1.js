const express = require("express");
const router = express.Router();

const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const authController = require("../controllers/authController");
const verifyToken = require("../helpers/verifyToken");

router.get("/posts", postsController.posts_get);

router.post("/posts", postsController.posts_post);

router.get("/posts/:id", postsController.post_get);

router.get("/posts/:id/comments", commentsController.comments_get);

router.post("/posts/:id/comments", commentsController.comments_post);

router.post("/signup", authController.sign_up);

router.post("/login", authController.log_in);

router.post("/adminlogin", authController.admin_log_in);

module.exports = router;
