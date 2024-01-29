const expressAsyncHandler = require("express-async-handler");
const Filter = require("bad-words");
const fs = require("fs");
const Post = require("../../model/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");
const User = require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/isBlock");

const createPostController = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  blockUser(req.user);
  //validateMongodbId(req.body.user);
  //check for bad words
  const filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);
  //block user
  if (isProfane) {
    const user = await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "Creating failed because it contains profane words and you have been blocked."
    );
  }

  /* if (
    req?.user?.accountType === "Starter Account" &&
    req?.user?.postCount === 2
  )
    throw new Error(
      "Starter account can only create two posts. Get more Followers"
    ); */
  //get the path to image
  const localPath = `public/images/posts/${req?.file?.filename}`;
  //upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);
  try {
    const post = await Post.create({
      ...req.body,
      user: _id,
      image: imgUploaded?.url,
    });
    console.log(req.user);
    await User.findByIdAndUpdate(
      _id,
      { $inc: { postCount: 1 } },
      {
        new: true,
      }
    );
    res.json(post);
    //Remove uploaded image
    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

const fetchPostsController = expressAsyncHandler(async (req, res) => {
  const hasCategory = req.query.category;
  try {
    if (hasCategory) {
      const posts = await Post.find({ category: hasCategory })
        .populate("user")
        .populate("comments")
        .sort("-createdAt");

      res.json(posts);
    } else {
      const posts = await Post.find({})
        .populate("user")
        .populate("comments")
        .sort("-createdAt");
      res.json(posts);
    }
  } catch (error) {
    res.json(error);
  }
});

const fetchPostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findById(id)
      .populate("user")
      .populate("dislikes")
      .populate("likes")
      .populate("comments");
    //update number of views
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

const updatePostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user?._id,
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

const deletePostController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndDelete(id);
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

//Likes
const toggleAddLikeToPostController = expressAsyncHandler(async (req, res) => {
  //1.Find the post to be liked
  const { postId } = req.body;
  const post = await Post.findById(postId);
  //2. Find the login user
  const loginUserId = req?.user?._id;
  //3. Find out if the user has liked the post
  const isLiked = post?.isLiked;
  //4. Check if the user has disliked the post
  const alreadyDisliked = post?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  //5. Remove the user from dislikes array if exists
  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Remove the user if he has likes
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    //Add to likes
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

//Dislikes
const toggleAddDislikeToPostController = expressAsyncHandler(
  async (req, res) => {
    //1. Find the post to be disliked
    const { postId } = req.body;
    const post = await Post.findById(postId);
    //2. Find the login user
    const loginUserId = req?.user?._id;
    //3. Check if the user has already dislikes
    const isDisliked = post?.isDisliked;
    //4. Check if already like the post
    const alreadyLiked = post?.likes?.find(
      (userId) => userId.toString() === loginUserId?.toString()
    );
    //Remove the user if he has dislikes
    if (alreadyLiked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(post);
    }
    //Remove the user from dislikes if already disliked
    if (isDisliked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(post);
    } else {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        },
        { new: true }
      );
      res.json(post);
    }
  }
);

module.exports = {
  createPostController,
  fetchPostsController,
  fetchPostController,
  updatePostController,
  deletePostController,
  toggleAddLikeToPostController,
  toggleAddDislikeToPostController,
};
