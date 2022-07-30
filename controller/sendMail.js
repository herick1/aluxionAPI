const nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ACCOUNT,
    pass: process.env.MAIL_PASSWORD,
  },
});

module.exports.sendResetEmail = async (email, token) => {
  var url = process.env.DOMAIN_NAME + "/user/reset-password?token=" + token;

  await smtpTransport.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "RESET YOUR PASSWORD",
    text: `Click on this link to reset your password ${url}`,
    html: `<h3> Click on this link to reset your password : ${url} </h3>`,
  });
};

module.exports.sendVerifyEmail = async (email, token) => {
  // change first part to your domain
  var url = process.env.DOMAIN_NAME + "/user/verifyemail?token=" + token;

  await smtpTransport.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "VERIFY Your EMAIL",
    text: `Click on this link to verify ${url}`,
    html: `<h3> Click on this link to verify your email : ${url} </h3>`,
  });
};
