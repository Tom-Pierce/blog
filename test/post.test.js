const chai = require("chai");
const chaiHttp = require("chai-http");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const app = require("../app");

const User = require("../models/user");

chai.use(chaiHttp);
const expect = chai.expect;

let mongoServer;
let JWT;
mongoose.set("strictQuery", false);

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  mongoose.connect(mongoUri);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Post tests", () => {
  it("should get a token", async () => {
    const res = await chai.request(app).post("/api/v1/login").send({
      email: "admin@gmail.com",
      password: "Password123",
    });
    expect(res.body).to.have.an("object").with.property("token");
    JWT = await res.body.token;
  });
  it("should get posts", async () => {
    const res = await chai.request(app).get("/api/v1/posts");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    res.body.forEach((element) => {
      expect(element).to.be.an("object");
      expect(element).to.haveOwnProperty("title");
      expect(element).to.haveOwnProperty("author");
      expect(element).to.haveOwnProperty("datePublished");
      expect(element).to.haveOwnProperty("text");
      expect(element).to.haveOwnProperty("comments");
    });
  });
  it("should get 201 when creating a new post", async () => {
    const res = await chai
      .request(app)
      .post("/api/v1/posts")
      .set("Authorization", JWT)
      .send({ title: "New post", text: "This is a post" });
    expect(res).to.have.status(201);

    // TODO add a route to become admin with password
  });
});
