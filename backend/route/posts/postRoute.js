const express = require("express");
const authMiddleware = require("../../middleware/auth/auhMiddleware");
const {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
  toggleAddLikeToPostController,
  toggleAddDislikeToPostController,
} = require("../../controllers/posts/postController");
const {
  photoUpload,
  postImageResize,
} = require("../../middleware/uploads/photoUpload");

const postRoutes = express.Router();

postRoutes.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  createPostController
);
postRoutes.put("/likes", authMiddleware, toggleAddLikeToPostController);
postRoutes.put("/dislikes", authMiddleware, toggleAddDislikeToPostController);
postRoutes.get("/", fetchPostsController);
postRoutes.get("/:id", fetchPostController);
postRoutes.put("/:id", authMiddleware, updatePostController);
postRoutes.delete("/:id", authMiddleware, deletePostController);

module.exports = postRoutes;
