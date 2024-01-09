const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

chai.use(chaiHttp);
const expect = chai.expect;

let JWT;

describe("Sign up authentication tests", () => {
  before(async () => {
    // clear database from previous tests
    await User.deleteMany({}).exec();
    await Post.deleteMany({}).exec();
    await Comment.deleteMany({}).exec();
  });

  it("should create a new user", async () => {
    const res = await chai.request(app).post("/api/v1/signup").send({
      email: "admin@gmail.com",
      username: "admin",
      password: "Password123",
      confirm_password: "Password123",
    });
    expect(res).to.have.status(201);
    expect(res.body.message).to.equal("User created succesfully");

    const user = await User.findOne().exec();
    expect(user.username).to.be.equal("admin");
    expect(user.email).to.be.equal("admin@gmail.com");
  });

  it("should send a 400 if passwords dont match", async () => {
    const res = await chai.request(app).post("/api/v1/signup").send({
      email: "admin@gmail.com",
      username: "admin",
      password: "Password123",
      confirm_password: "Password1234",
    });
    expect(res).to.have.status(400);
  });

  it("should send a 400 if email is invalid", async () => {
    const res = await chai.request(app).post("/api/v1/signup").send({
      email: "admin@com",
      username: "admin",
      password: "Password123",
      confirm_password: "Password123",
    });
    expect(res).to.have.status(400);
    expect(res.body.errors[0].msg).to.equal("Please provide a valid email");
  });

  it("should send a 400 if username is invalid", async () => {
    const res = await chai.request(app).post("/api/v1/signup").send({
      email: "admin@com",
      username: "a",
      password: "Password123",
      confirm_password: "Password123",
    });
    expect(res).to.have.status(400);
    expect(res.body.errors[0].msg).to.equal(
      "Username must be longer than 3 characters"
    );
  });

  it("should send a 400 if password is invalid", async () => {
    const res = await chai.request(app).post("/api/v1/signup").send({
      email: "admin@com",
      username: "admin",
      password: "test",
      confirm_password: "Password123",
    });
    expect(res).to.have.status(400);
    expect(res.body.errors[0].msg).to.equal(
      "Password must be 8 characters, contain 1 uppercase character, and 1 number"
    );
  });
});

describe("Login authentication tests", () => {
  it("should send a token for authentication", async () => {
    const res = await chai.request(app).post("/api/v1/login").send({
      email: "admin@gmail.com",
      password: "Password123",
    });
    // Extract token from cookies, not the best way as it assumes it is the first cookie but will work for testing
    expect(res).to.have.cookie("token");
    const token = res.header["set-cookie"][0].split(";")[0].split("=")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      expect(decoded).to.have.property("_id");
      expect(decoded).to.have.property("username");
      expect(decoded).to.have.property("isAdmin");
      expect(decoded.username).to.equal("admin");
      JWT = token;
    });
  });

  it("should send 401 if password is incorrect", async () => {
    const res = await chai.request(app).post("/api/v1/login").send({
      email: "admin@gmail.com",
      password: "Password1234",
    });
    expect(res).to.have.status(401);
  });

  it("should send 401 if email is incorrect", async () => {
    const res = await chai.request(app).post("/api/v1/login").send({
      email: "admin1@gmail.com",
      password: "Password123",
    });
    expect(res).to.have.status(401);
  });

  it("should send 401 if user is not logged in while trying to become admin", async () => {
    const res = await chai.request(app).post("/api/v1/adminlogin").send({
      password: "adminpassword",
    });
    expect(res).to.have.status(401);
    expect(res.body.message).to.be.equal(
      "User must be logged in to become admin"
    );
  });

  it("should send 401 if admin password is incorrect", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/adminlogin")
      .set("Cookie", `token=${JWT}`)
      .send({
        admin_password: "adminpasswor",
      });
    expect(res).to.have.status(401);
    expect(res.body.message).to.be.equal("Incorrect password");
  });

  it("should send 201 and a new token should be sent", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/adminlogin")
      .set("Cookie", `token=${JWT}`)
      .send({
        admin_password: "adminpassword",
      });
    expect(res).to.have.status(201);
    expect(res.body.message).to.be.equal("User changed to admin");
    expect(res).to.have.cookie("token");

    const token = res.header["set-cookie"][0].split(";")[0].split("=")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      expect(decoded).to.have.property("_id");
      expect(decoded).to.have.property("username");
      expect(decoded).to.have.property("isAdmin");
      expect(decoded.username).to.equal("admin");
      expect(decoded.isAdmin).to.equal(true);
      JWT = token;
    });
  });
});
