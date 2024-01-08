const express = require("express");
const {
  userRegisterController,
  userLoginController,
  userFetchController,
  userDeleteController,
  userDetailsFetchController,
  userProfileController,
  userUpdateController,
  updatePasswordController,
  followingUserController,
  unfollowingUserController,
  blockUserController,
  unblockUserController,
  generateVerificationTokenController,
  accountVerificationController,
  forgetPasswordController,
  passwordResetController,
  profilePhotoUploadController,
} = require("../../controllers/users/usersController");
const authMiddleware = require("../../middleware/auth/auhMiddleware");
const {
  photoUpload,
  profilePhotoResize,
} = require("../../middleware/uploads/photoUpload");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterController);
userRoutes.post("/login", userLoginController);
userRoutes.get("/", authMiddleware, userFetchController);
userRoutes.put(
  "/profilephoto-upload",
  authMiddleware,
  photoUpload.single("image"),
  profilePhotoResize,
  profilePhotoUploadController
);
userRoutes.put("/password", authMiddleware, updatePasswordController);
userRoutes.post("/forget-password-token", forgetPasswordController);
userRoutes.put("/reset-password", passwordResetController);
userRoutes.put("/follow", authMiddleware, followingUserController);
userRoutes.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationTokenController
);
userRoutes.put(
  "/verify-account",
  authMiddleware,
  accountVerificationController
);
userRoutes.put("/unfollow", authMiddleware, unfollowingUserController);
userRoutes.put("/block-user/:id", authMiddleware, blockUserController);
userRoutes.put("/unblock-user/:id", authMiddleware, unblockUserController);
userRoutes.get("/profile/:id", authMiddleware, userProfileController);
userRoutes.get("/:id", userDetailsFetchController);
userRoutes.put("/", authMiddleware, userUpdateController);
userRoutes.delete("/:id", userDeleteController);

module.exports = userRoutes;
