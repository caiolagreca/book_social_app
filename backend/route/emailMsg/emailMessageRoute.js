const express = require("express");
const authMiddleware = require("../../middleware/auth/auhMiddleware");
const {
  sendEmailMsgController,
} = require("../../controllers/emailMsg/emailMsgController");

const emailMsgRoutes = express.Router();

emailMsgRoutes.post("/", authMiddleware, sendEmailMsgController);

module.exports = emailMsgRoutes;
