const { body } = require("express-validator");

//Code to validate user registration
const validateRegistration = [
  // Validate username
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  // Validate email
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // Validate password
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),
];

module.exports = { validateRegistration };
