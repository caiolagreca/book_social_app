const express = require("express");
const {
  createCategoryController,
  fetchCategoriesController,
  fetchCategoryController,
  updateCategoryController,
  deleteCategoryController,
} = require("../../controllers/category/categoryController");
const authMiddleware = require("../../middleware/auth/auhMiddleware");

const categoryRoutes = express.Router();

categoryRoutes.post("/", authMiddleware, createCategoryController);
categoryRoutes.get("/", fetchCategoriesController);
categoryRoutes.get("/:id", fetchCategoryController);
categoryRoutes.put("/:id", authMiddleware, updateCategoryController);
categoryRoutes.delete("/:id", authMiddleware, deleteCategoryController);

module.exports = categoryRoutes;
