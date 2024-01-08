const expressAsyncHandler = require("express-async-handler");
const crypto = require("crypto");
const fs = require("fs");
const User = require("../../model/user/User");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");
const nodemailer = require("nodemailer");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/isBlock");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.HOTMAIL_USER,
    pass: process.env.HOTMAIL_PASS,
  },
});

//Register
const userRegisterController = expressAsyncHandler(async (req, res) => {
  //Check if user exists
  const userExists = await User.findOne({ email: req?.body?.email });
  if (userExists) throw new Error("User already exists");

  try {
    //Register user
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//Login
const userLoginController = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Check if user exists
  const userFound = await User.findOne({ email });
  if (userFound?.isBlocked)
    throw new Error("Acess denied, you have been blocked");
  //Check if password is match
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
      isVerified: userFound?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});

//Fetch Users
const userFetchController = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).populate("posts");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//Fetch single User
const userDetailsFetchController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //Check if user Id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//User Profile
const userProfileController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const loginUserId = req?.user?._id?.toString();
  try {
    const myProfile = await User.findById(id)
      .populate("posts")
      .populate("viewedBy");
    const alreadyViewed = myProfile?.viewedBy?.find((user) => {
      return user?._id?.toString() === loginUserId;
    });
    if (alreadyViewed) {
      res.json(myProfile);
    } else {
      const profile = await User.findByIdAndUpdate(myProfile?._id, {
        $push: { viewedBy: loginUserId },
      });
      res.json(profile);
    }
  } catch (error) {
    res.json(error);
  }
});

//User Update
const userUpdateController = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  validateMongodbId(_id);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//Delete User
const userDeleteController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //Check if user Id is valid
  validateMongodbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (error) {
    res.json(error);
  }
});

//Update Password
const updatePasswordController = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updateUser = await user.save();
    res.json(updateUser);
  }
  res.json(user);
});

//Following
const followingUserController = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //Find the target User and check if the login Id exist
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You already follow this User");
  //Find the user you want to follow and update it's followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  //Update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
});

const unfollowingUserController = expressAsyncHandler(async (req, res) => {
  const { unfollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unfollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unfollowId },
    },
    { new: true }
  );

  res.json("You have successfully unfollow this User");
});

const blockUserController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
});

const unblockUserController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
});

//Generate email verification token
const generateVerificationTokenController = expressAsyncHandler(
  async (req, res) => {
    const loginUserId = req.user.id;

    const user = await User.findById(loginUserId);
    try {
      //generate token
      const verificationToken = await user.createAccountVerificationToken();

      await user.save();
      console.log(verificationToken);

      const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message <a href="https://book-social-app-backend.onrender.com/verify-account/${verificationToken}">Click to verify</a>`;
      const message = {
        from: "caiomiranda701@hotmail.com",
        to: user?.email,
        subject: "Verify your account",
        html: resetURL,
      };
      await transporter.sendMail(message);
      res.json(resetURL);
    } catch (error) {
      res.json(error);
    }
  }
);

//Account verification
const accountVerificationController = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //find user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token expired, try again later.");

  //udpate the proprt to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
});

//Forget password generator
const forgetPasswordController = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();

    const resetURL = `If you were requested to verify your password, verify now within 10 minutes, otherwise ignore this message <a href="https://book-social-app-backend.onrender.com/forget-password/${token}">Click to verify</a>`;
    const message = {
      from: "caiomiranda701@hotmail.com",
      to: email,
      subject: "Reset Password",
      html: resetURL,
    };
    await transporter.sendMail(message);
    res.json({
      msg: `A verification message is successfully sent to ${user?.email}. Reset now within 10 minutes, ${resetURL}`,
    });
  } catch (error) {
    res.json(error);
  }
});

//Password reset
const passwordResetController = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //find the user by token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Token expired, try again later");

  //Update the password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const profilePhotoUploadController = expressAsyncHandler(async (req, res) => {
  //find the login user
  const { _id } = req.user;
  blockUser(req.user);
  //get the path to image
  const localPath = `public/images/profile/${req.file.filename}`;
  //upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );
  //remove the saved image
  fs.unlinkSync(localPath);
  res.json(foundUser);
});

module.exports = {
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
};
