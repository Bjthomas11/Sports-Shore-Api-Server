"use strict";
const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { app, runServer, closeServer } = require("../server");
const { User } = require("../users");
const { JWT_SECRET, TEST_DATABASE_URL } = require("../config");
const expect = chai.expect;

chai.use(chaiHttp);
``;

function handleError(err) {
  if (err instanceof chai.AssertionError) {
    throw err;
  } else {
    console.error(err);
  }
}

describe("Auth endpoints", function() {
  let id = null;
  const username = "User";
  const password = "Password";
  const screenName = "ExampleUser";
  const firstName = "FirstNameExample";
  const lastName = "LastNameExample";

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(password => {
        return User.create({
          username,
          password,
          screenName,
          firstName,
          lastName
        });
      })
      .then(user => {
        id = user.id;
      });
  });

  afterEach(function() {
    return mongoose.connection.dropDatabase();
  });

  describe("/auth/login", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
    it("Should reject requests with incorrect usernames", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "wrongUsername", password })
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
    it("Should reject requests with incorrect passwords", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username, password: "wrongPassword" })
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
  });

  describe("/auth/refresh", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .post("/auth/refresh")
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
    it("Should reject requests with an invalid token", function() {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        "wrongSecret",
        {
          algorithm: "HS256",
          expiresIn: "7d"
        }
      );

      return chai
        .request(app)
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
    it("Should reject requests with an expired token", function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: username
        }
      );

      return chai
        .request(app)
        .post("/auth/refresh")
        .set("authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });
  });
});
