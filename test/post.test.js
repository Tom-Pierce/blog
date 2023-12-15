const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Post tests", () => {
  // get JWT token as admin to test posting
  let adminToken;
  let userToken;
  before(async () => {
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
      .set("Authorization", `Bearer ${JWT}`)
      .send({ title: "New post", text: "This is a post" });
    expect(res).to.have.status(201);
  });
});
