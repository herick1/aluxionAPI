const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mailer = require('../services/sendMail');
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const oldusername = await User.findOne({ username });
    if (oldusername) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});


router.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }else{
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/forgot-password", async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;

      mailer.sendResetEmailApi(email, token);

      res.status(200).send("Token enviado al correo");

    }else{
      res.status(400).send("Invalid Credentials");      
    }

});

router.post("/reset-password", auth , async (req, res) => {

    const { password, password2, email } = req.body;
    if (!password || !password2 || (password2 != password)) {
      res.status(400).send("Invalid Credentials"); 
    } else {
        // encrypt the password
        var salt = await bcrypt.genSalt(12);
        if (salt) {
            var hash = await bcrypt.hash(password, salt);
            var user =await User.findOneAndUpdate({ email: email }, { $set: { password: hash } });
            res.status(200).json(user);
        } else {
          res.status(400).send("Unexpected Error Try Again");
        }
    }
});
  
module.exports = router;