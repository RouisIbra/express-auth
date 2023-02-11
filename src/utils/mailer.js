const nodemailer = require("nodemailer");
const debug = require("debug")("express-auth:mailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

const sendResetPasswordMail = async (userEmail, resetHash) => {
  if (!userEmail) {
    throw new Error("User email is null");
  }

  if (!resetHash && !(resetHash instanceof String)) {
    throw new Error("Reset hash has to be a non null string");
  }

  let info = await transporter.sendMail({
    from: '"Noreply 👻" <noreply@example.com>', // sender address
    to: userEmail,
    subject: "Reset Password", // Subject line
    text: `Reset Code: ${resetHash}\n`,
    html: `<p>Reset Code: <b>${resetHash}</b></p>`,
  });

  debug("Message sent: %s", info.messageId);
  debug("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendResetPasswordMail };
