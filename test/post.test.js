const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Post tests", () => {
  // get JWT token as admin to test posting
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
  });

  it("should get 201 when creating a new post", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New post", text: "This is a post", published: true });
    expect(res).to.have.status(201);
    expect(res.body.message).to.equal("Post created");
  });

  it("should get 403 when creating a new post without being admin", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "New post", text: "This is a post", published: true });
    expect(res).to.have.status(403);
    expect(res.body.message).to.equal("Must be admin to create a post");
  });

  it("should get 400 when creating a new post with invalid fields", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "", text: "", published: "blahblag" });
    expect(res).to.have.status(400);
    expect(res.body.errors).to.be.an("array").of.length(3);
  });

  it("should get all posts", async () => {
    const res = await chai.request(app).get("/api/v1/posts");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array").of.length(1);
    expect(res.body[0]).to.be.an("object");
    expect(res.body[0]).to.haveOwnProperty("title");
    expect(res.body[0]).to.haveOwnProperty("author");
    expect(res.body[0]).to.haveOwnProperty("datePublished");
    expect(res.body[0]).to.haveOwnProperty("text");
    expect(res.body[0]).to.haveOwnProperty("comments");
    postId = res.body[0]._id;
  });

  it("should get a post with a specific id", async () => {
    const res = await chai.request(app).get(`/api/v1/posts/${postId}`);
    expect(res.body).to.be.an("object");
    expect(res.body).to.haveOwnProperty("title").equal("New post");
    expect(res.body)
      .to.haveOwnProperty("author")
      .with.property("username")
      .equal("admin");
    expect(res.body).to.haveOwnProperty("datePublished");
    expect(res.body).to.haveOwnProperty("text").equal("This is a post");
    expect(res.body).to.haveOwnProperty("comments");
  });

  it("should respond with 204 if admin updates post", async () => {
    const res = await chai
      .request(app)
      .put(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Updated Post Title",
        text: "This is an updated post",
        published: false,
      });
    expect(res).to.have.status(204);
  });

  it("should not allow non admin to delete posts", async () => {
    const res = await chai
      .request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res).to.have.status(401);
    expect(res.body.message).to.equal("Must be admin to delete posts");
  });

  it("should respond with 204 if admin deletes posts", async () => {
    const res = await chai
      .request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res).to.have.status(204);
  });

  it("should not allow non admins to update posts", async () => {
    const res = await chai
      .request(app)
      .put(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Updated Post Title",
        text: "This is an updated post",
        published: false,
      });
    expect(res).to.have.status(401);
    expect(res.body.message).to.equal("Must be admin to update posts");
  });

  it("should respond with 404 if admin updates post that does not exist", async () => {
    const res = await chai
      .request(app)
      .put(`/api/v1/posts/fakeId`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Updated Post Title",
        text: "This is an updated post",
        published: false,
      });
    expect(res).to.have.status(404);
    expect(res.body.message).to.equal("Post not found");
  });
});
