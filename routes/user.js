const express = require("express");
const { body } = require('express-validator');
const userCtrl = require("../controllers/user");

const router = express.Router();

router.post(
    "/signup", 
    body("email").isEmail(), 
    // Defaults to minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    body("password").isStrongPassword(), 
    userCtrl.signup
);
router.post("/login", userCtrl.login);

module.exports = router;
