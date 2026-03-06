import express from "express";
import upload from "../middlwares/uploads.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  addRating,
  searchProducts,
  getProductById,
} from "../Controller/ProductController.js";
import { verifyToken } from "../middlwares/AuthMiddlwares.js";

const router = express.Router();

// POST route for creating a product (with image upload)
router.post("/", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(err); // Use next() to propagate the error to centralized error handler
    }
    createProduct(req, res); // If no errors, proceed to product creation
  });
});
router.post("/rating",verifyToken, addRating);

// GET all products
router.get("/", getProducts);

// DELETE all products
router.delete("/", deleteAllProducts);

// GET product by search query
router.get("/search", searchProducts);

// GET product by ID
router.get("/:id", getProductById);

// PUT to update a product by ID
router.put("/:id", updateProduct);

// DELETE product by ID
router.delete("/:id", deleteProduct);

export default router;
