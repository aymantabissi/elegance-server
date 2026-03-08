import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 1, // Default to 1 if not specified
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,  // Default value for rating if not provided
      min: 0,  // Minimum rating can be 0
      max: 5,  // Maximum rating is 5
    },
    reviews: {
      type: Number,
      default: 0, // Default to 0 reviews if not specified
    },
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who gave the rating
      rating: { type: Number, min: 1, max: 5 }, // Rating value between 1 and 5
    }],
  }, { timestamps: true });
  

const Product = mongoose.model('Product', productSchema);
export default Product;
