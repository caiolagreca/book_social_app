const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const EmailMsg = require("../../model/emailMessaging/EmailMessaging");
const Filter = require("bad-words");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.HOTMAIL_USER,
    pass: process.env.HOTMAIL_PASS,
  },
});

const sendEmailMsgController = expressAsyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  const emailMessage = subject + " " + message;
  //prevent bad words
  const filter = new Filter();

  const isProfane = filter.isProfane(emailMessage);
  if (isProfane) throw new Error("Email failed, contains inapropriated words");
  try {
    //build up message
    const msg = {
      to,
      subject,
      text: message,
      from: "caiomiranda701@hotmail.com",
    };
    //send message
    await transporter.sendMail(msg);
    //send to our DB
    await EmailMsg.create({
      sentBy: req?.user?._id,
      from: req?.user?.email,
      to,
      message,
      subject,
    });
    res.json("email sent");
  } catch (error) {
    res.json(error);
  }
});

module.exports = { sendEmailMsgController };
