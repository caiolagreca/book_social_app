const express = require("express");
const authMiddleware = require("../../middleware/auth/auhMiddleware");
const {
  createCommentController,
  fetchAllCommentsController,
  fetchCommentController,
  deleteCommentController,
  updateCommentController,
} = require("../../controllers/comments/commentController");

const commentRoutes = express.Router();

commentRoutes.post("/", authMiddleware, createCommentController);
commentRoutes.get("/", fetchAllCommentsController);
commentRoutes.get("/:id", authMiddleware, fetchCommentController);
commentRoutes.put("/:id", authMiddleware, updateCommentController);
commentRoutes.delete("/:id", authMiddleware, deleteCommentController);

module.exports = commentRoutes;
