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
        return res.status(201).json({
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
    jwt.sign(
      {
        // It would be more secure to check if the user is admin by querying the database, however to
        // to reduce the number of queries we will pass it through the JWT
        username: req.user.username,
        isAdmin: req.user.isAdmin,
        _id: req.user._id,
      },
      process.env.JWT_SECRET,
      (err, token) => {
        res.json({ token });
      }
    );
  },
];

exports.admin_log_in = async (req, res, next) => {
  if (req.user !== undefined) {
    if (req.body.admin_password === process.env.ADMIN_PASSWORD) {
      await User.findByIdAndUpdate(req.user.id, { isAdmin: true }).exec();
      jwt.sign(
        {
          username: req.user.username,
          isAdmin: true,
          _id: req.user._id,
        },
        process.env.JWT_SECRET,
        (err, token) => {
          return res
            .status(201)
            .json({ token, message: "User changed to admin" });
        }
      );
      return res.status(500);
    }
    return res.status(401).json({ message: "Incorrect password" });
  }
  return res
    .status(401)
    .json({ message: "User must be logged in to become admin" });
};
