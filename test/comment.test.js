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
  let commentId;

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

    userToken = loginRes.header["set-cookie"][0].split(";")[0].split("=")[1];

    const adminRes = await chai
      .request(app)
      .post("/api/v1/adminlogin")
      .set("Cookie", `token=${userToken}`)
      .send({
        admin_password: "adminpassword",
      });
    adminToken = adminRes.header["set-cookie"][0].split(";")[0].split("=")[1];

    await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Cookie", `token=${adminToken}`)
      .send({ title: "New post", text: "This is a post", published: true });

    const postsRes = await chai.request(app).get("/api/v1/posts");
    postId = postsRes.body[0]._id;
  });

  it("should get 201 when logged in user comments", async () => {
    const res = await chai
      .request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set("Cookie", `token=${userToken}`)
      .send({ text: "This is a comment" });
    expect(res).to.have.status(201);
  });

  it("should get 401 when not logged in user comments", async () => {
    const res = await chai
      .request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .send({ text: "This is a comment" });
    expect(res).to.have.status(403);
  });

  it("should get all comments from a post", async () => {
    const res = await chai.request(app).get(`/api/v1/posts/${postId}/comments`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array").of.length(1);
    expect(res.body[0]).to.be.an("object");
    expect(res.body[0]).to.have.property("_id");
    expect(res.body[0]).to.have.property("author");
    expect(res.body[0]).to.have.property("text");
    expect(res.body[0]).to.have.property("likes");
    expect(res.body[0]).to.have.property("dateSent");
    commentId = res.body[0]._id;
  });

  it("should get comment with specific id", async () => {
    const res = await chai
      .request(app)
      .get(`/api/v1/posts/${postId}/comments/${commentId}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.an("object");
    expect(res.body._id).to.equal(commentId);
  });

  it("should not allow non admin to delete comment", async () => {
    const res = await chai
      .request(app)
      .delete(`/api/v1/posts/${postId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res).to.have.status(401);
    expect(res.body.message).to.equal("Must be admin to delete comments");
  });

  it("should respond with 204 if admin deletes comment", async () => {
    const res = await chai
      .request(app)
      .delete(`/api/v1/posts/${postId}/comments/${commentId}`)
      .set("Cookie", `token=${adminToken}`);
    expect(res).to.have.status(204);
  });
});
