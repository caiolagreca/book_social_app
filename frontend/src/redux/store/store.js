import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../slices/users/usersSlices";
import categoriesReducer from "../slices/categories/categorySlice";
import post from "../slices/posts/postSlices";
import comment from "../slices/comments/commentSlices";
import sendEmail from "../slices/email/emailSlices";
import accountVerification from "../slices/accountVerification/accVerificationSlices";

const store = configureStore({
  reducer: {
    users: usersReducer,
    category: categoriesReducer,
    post,
    comment,
    sendEmail,
    accountVerification,
  },
});

export default store;
