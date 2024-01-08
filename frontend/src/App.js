import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import Register from "./components/Users/Register/Register";
import Login from "./components/Users/Login/Login";
import Navbar from "./components/Navigation/Navbar";
import AddNewCategory from "./components/Categories/AddNewCategory";
import CategoryList from "./components/Categories/CategoryList";
import UpdateCategory from "./components/Categories/UpdateCategory";
import PrivateProtectedRoute from "./components/Navigation/ProtectedRoutes/PrivateProtectedRoute";
import AdminRoute from "./components/Navigation/ProtectedRoutes/AdminRoute";
import CreatePost from "./components/Posts/CreatePost";
import PostsList from "./components/Posts/PostsList";
import PostDetails from "./components/Posts/PostDetails";
import UpdatePost from "./components/Posts/UpdatePost";
import UpdateComment from "./components/Comments/UpdateComment.";
import Profile from "./components/Users/Profile/Profile";
import UploadProfilePhoto from "./components/Users/Profile/UploadProfilePhoto";
import UpdateProfileForm from "./components/Users/Profile/UpdateProfileForm";
import SendEmail from "./components/Users/Emailing/SendEmail";
import AccountVerified from "./components/Users/AccountVerification/AccountVerified";
import UsersList from "./components/Users/UsersList/UsersList";
import UpdatePassword from "./components/Users/PasswordManagement/UpdatePassword";
import ResetPasswordForm from "./components/Users/PasswordManagement/ResetPasswordForm";
import ResetPassword from "./components/Users/PasswordManagement/ResetPassword";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/update-category/:id"
          element={<AdminRoute component={UpdateCategory} />}
        />
        <Route path="/password-reset-token" element={<ResetPasswordForm />} />
        <Route path="/forget-password/:token" element={<ResetPassword />} />
        <Route path="/users" element={<AdminRoute component={UsersList} />} />
        <Route
          path="/upload-profile-photo"
          element={<PrivateProtectedRoute component={UploadProfilePhoto} />}
        />
        <Route
          path="/update-password"
          element={<PrivateProtectedRoute component={UpdatePassword} />}
        />
        <Route
          path="/verify-account/:id"
          element={<PrivateProtectedRoute component={AccountVerified} />}
        />
        <Route
          path="/send-email/:email/:id"
          element={<AdminRoute component={SendEmail} />}
        />
        <Route
          path="/update-profile/:id"
          element={<PrivateProtectedRoute component={UpdateProfileForm} />}
        />
        <Route
          path="/update-post/:id"
          element={<PrivateProtectedRoute component={UpdatePost} />}
        />
        <Route
          path="/create-post"
          element={<PrivateProtectedRoute component={CreatePost} />}
        />
        <Route
          path="/profile/:id"
          element={<PrivateProtectedRoute component={Profile} />}
        />
        <Route
          path="/update-comment/:id"
          element={<PrivateProtectedRoute component={UpdateComment} />}
        />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route
          path="/add-category"
          element={<AdminRoute component={AddNewCategory} />}
        />

        <Route
          path="/category-list"
          element={<AdminRoute component={CategoryList} />}
        />
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
