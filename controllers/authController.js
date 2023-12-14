const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.sign_up = [
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must be longer than 3 characters")
    .escape(),

  body("password")
    .trim()
    // Checks if password fits the minimum requirements
    .custom((value) => {
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);

      if (!(hasUppercase && hasNumber && value.length >= 8)) {
        throw new Error(
          "Password must be 8 characters, contain 1 uppercase character, and 1 number"
        );
      }

      return true;
    })
    // Checks if passwords match
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.confirm_password) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    })
    .escape(),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    // Hash password and create user
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return err;
        }
        const user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });
        await user.save();
        res.status(200).json({
          message: "User created succesfully",
        });
      });
    } catch (error) {
      return next(error);
    }
  },
];

// Authenticate and send json web token
exports.log_in = [
  passport.authenticate("local", {
    session: false,
  }),
  async (req, res, next) => {
    jwt.sign({ user: req.user }, process.env.JWT_SECRET, (err, token) => {
      res.json({ token });
    });
  },
];
