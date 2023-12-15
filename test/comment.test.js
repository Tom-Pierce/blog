const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Comments tests", () => {
  let adminToken;
  let userToken;
  let postId;

  before(async () => {
    // clear database from previous tests
    await User.deleteMany({}).exec();
    await Post.deleteMany({}).exec();
    await Comment.deleteMany({}).exec();

    // create new user
    await chai.request(app).post("/api/v1/signup").send({
      email: "admin@gmail.com",
      username: "admin",
      password: "Password123",
      confirm_password: "Password123",
    });

    const loginRes = await chai
      .request(app)
      .post("/api/v1/login")
      .send({ email: "admin@gmail.com", password: "Password123" });

    userToken = loginRes.body.token;

    const adminRes = await chai
      .request(app)
      .post("/api/v1/adminlogin")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        admin_password: "adminpassword",
      });
    adminToken = adminRes.body.token;
    await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New post", text: "This is a post", published: true });
  });
});
