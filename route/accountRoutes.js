const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const resetToken = require('../model/resetTokens');
const user = require('../model/user');
const mailer = require('../services/sendMail');
const bcryptjs = require('bcryptjs');

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

router.get('/user/send-verification-email', checkAuth, async (req, res) => {

    if (req.user.isVerified ) {
        res.redirect('/profile');
    } else {
        // generate a token 
        var token = crypto.randomBytes(32).toString('hex');
        // add that to database
        await resetToken({ token: token, email: req.user.email }).save();
        // send an email for verification
        mailer.sendVerifyEmail(req.user.email, token);
        res.render('profile', { username: req.user.username, verified: req.user.isVerified, emailsent: true });
    }
});


router.get('/user/verifyemail', async (req, res) => {
    // grab the token
    const token = req.query.token;
    // check if token exists 
    // or just send an error
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            // token verified
            // set the property of verified to true for the user
            var userData = await user.findOne({ email: check.email });
            userData.isVerified = true;
            await userData.save();
            // delete the token now itself
            await resetToken.findOneAndDelete({ token: token });
            res.redirect('/profile');
        } else {
            res.render('profile', { username: req.user.username, verified: req.user.isVerified, err: "Invalid token or Token has expired, Try again." });
        }
    } else {
        res.redirect('/profile');
    }
});

router.get('/user/forgot-password', async (req, res) => {
    res.render('forgot-password.ejs', {  logged: false, page: "forgot-password"  });

});

router.post('/user/forgot-password', async (req, res) => {
    const { email } = req.body;
    var userData = await user.findOne({ email: email });

    if (userData) {
            var token = crypto.randomBytes(32).toString('hex');
            // add that to database
            await resetToken({ token: token, email: email }).save();

            mailer.sendResetEmail(email, token);

            res.render('forgot-password.ejs', {  logged: false, page: "forgot-password" , msg: "Reset email sent. Check your email for more info.", type: 'success' });
        
    } else {
        res.render('forgot-password.ejs', {  logged: false, page: "forgot-password" , msg: "No user Exists with this email.", type: 'danger' });

    }
});

router.get('/user/reset-password', async (req, res) => {

    const token = req.query.token;
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            res.render('forgot-password.ejs', {  logged: false, page: "forgot-password" , reset: true, email: check.email });
        } else {
            res.render('forgot-password.ejs', {  logged: false, page: "forgot-password" , msg: "Token Tampered or Expired.", type: 'danger' });
        }
    } else {
        res.redirect('/login');
    }

});


router.post('/user/reset-password', async (req, res) => {
    // get passwords
    const { password, password2, email } = req.body;
    if (!password || !password2 || (password2 != password)) {
        res.render('forgot-password.ejs', { logged: false, page: "forgot-password" , reset: true, err: "Passwords Don't Match !", email: email });
    } else {
        // encrypt the password
        var salt = await bcryptjs.genSalt(12);
        if (salt) {
            var hash = await bcryptjs.hash(password, salt);
            await user.findOneAndUpdate({ email: email }, { $set: { password: hash } });
            res.redirect('/login');
        } else {
            res.render('forgot-password.ejs', {  logged: false, page: "forgot-password" , reset: true, err: "Unexpected Error Try Again", email: email });

        }
    }
});


module.exports = router;