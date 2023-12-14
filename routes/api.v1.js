const express = require("express");
const router = express.Router();

const postsController = require("../controllers/postsControllers");
const authController = require("../controllers/authController");
const verifyToken = require("../helpers/verifyToken");

router.get("/posts", postsController.posts_get);

router.post("/posts", verifyToken, postsController.posts_post);

router.get("/posts/:id", postsController.post_get);

router.post("/signup", authController.sign_up);

router.post("/login", authController.log_in);

module.exports = router;
