const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");
const { errorHandler, notFound } = require("./middleware/error/errorHandler");
const postRoutes = require("./route/posts/postRoute");
errorHandler;
const commentRoutes = require("./route/comments/commentRoute");
const emailMsgRoutes = require("./route/emailMsg/emailMessageRoute");
const categoryRoutes = require("./route/category/categoryRoute");
const app = express();

//DB
dbConnect();

//Middleware
app.use(express.json());

//cors
app.use(cors());

//custom middleware
const logger = (req, res, next) => {
  console.log("Middleware");
  next();
};

//2. usage
app.use(logger);

//Users Route
app.use("/api/users", userRoutes);

//Post Route
app.use("/api/posts", postRoutes);

//Comment Route
app.use("/api/comments", commentRoutes);

//EmailMessage Route
app.use("/api/email", emailMsgRoutes);

//Category Route
app.use("/api/category", categoryRoutes);

//Error Handler
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is running at ${PORT}`));
