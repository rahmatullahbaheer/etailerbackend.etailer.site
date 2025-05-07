const { body, validationResult } = require("express-validator");

const validateRegistration = [
  // Validate 'type' field
  body("type")
    .isIn(["GOOGLE", "APPLE", "EMAIL"])
    .withMessage("Type must be one of the following: GOOGLE, APPLE, EMAIL"),

  // Validate 'email' field
  body("email")
    .if(body("type").isIn(["GOOGLE", "APPLE", "EMAIL"]))
    .isEmail()
    .withMessage("A valid email is required"),

  // Validate 'password' field
  body("password")
    .if(body("type").equals("EMAIL"))
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),

  // Validate 'token' field
  body("token")
    .if(body("type").isIn(["GOOGLE", "APPLE"]))
    .notEmpty()
    .withMessage("Token is required for GOOGLE or APPLE login"),
];
