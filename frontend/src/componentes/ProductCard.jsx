import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProductStore } from "../store/product";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import axios from "axios";

function ProductCard({ product, userRole }) {
  // Image fallback logic
  const imageUrl = product.image && product.image.startsWith("/uploads/")
    ? `http://localhost:5000${product.image}`
    : product.image || "/path/to/default-image.jpg";

  const { deleteProduct, updateProduct } = useProductStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: product.name,
    price: product.price,
    image: product.image,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const location = useLocation();

  const handleDeleteProduct = async (pid) => {
    try {
      const { success, message } = await deleteProduct(pid);
      if (success) {
        toast.success("Product deleted successfully");
      } else {
        toast.error(`Failed to delete product: ${message}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    try {
      const response = await updateProduct(pid, updatedProduct);
      if (response && response.success) {
        toast.success("Product updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error(`Failed to update product: ${response?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating the product");
    }
  };

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product exists in cart
    const existingProduct = cart.find((item) => item._id === product._id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Notify the navbar to update cart count
    window.dispatchEvent(new Event("cartUpdated"));
    // Show notification
    toast.success("Produit ajouté au panier 🛒");
  };

  // Function to handle rating
  const handleRating = async (newRating) => {
    console.log('Product ID:', product._id);
    console.log('New Rating:', newRating);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to rate products");
      return;
    }
    
    setIsRating(true);

    try {
      const response = await axios.post("http://localhost:5000/api/products/rating", 
        {
          productId: product._id,
          rating: newRating,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success("Rating added successfully");
        // Update product rating dynamically
        product.rating = (product.rating * product.reviews + newRating) / (product.reviews + 1);
        product.reviews += 1;
      } else {
        toast.error("Failed to add rating");
      }
    } catch (error) {
      // If the error is related to authentication (401 status)
      if (error.response && error.response.status === 401) {
        toast.error("You must be logged in to rate products");
      } else {
        console.error("Error adding rating:", error);
        toast.error("An error occurred while adding the rating");
      }
    } finally {
      setIsRating(false);
    }
  };

  // Function to render stars with animation
  const renderStars = (rating) => {
    const filledStars = Math.round(rating);
    const emptyStars = 5 - filledStars;
    
    return (
      <div className="flex items-center text-sm">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoveredRating || filledStars);
          
          return (
            <span 
              key={index} 
              className={`text-xl cursor-pointer transition-all duration-300 transform ${
                isRating ? 'animate-pulse' : ''
              } ${
                isFilled ? 'text-yellow-400 scale-110' : 'text-gray-300'
              } ${
                hoveredRating && starValue <= hoveredRating ? 'scale-125' : ''
              }`}
              onClick={() => handleRating(starValue)}
              onMouseEnter={() => setHoveredRating(starValue)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              {isFilled ? '★' : '☆'}
            </span>
          );
        })}
        {product.reviews > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            ({product.reviews} {product.reviews === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative bg-white rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <Link to={`/product/${product._id}`}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded-t-lg"
        />
      </Link>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
        <p className="text-lg text-gray-500 my-2">${product.price}</p>
        
        {/* Display stars and rating */}
        {renderStars(product.rating)}

        <div className="flex justify-between items-center mt-4">
          {userRole === "admin" && location.pathname === "/Dashbord" ? (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setIsModalOpen(true)}
              >
                Update
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={() => handleDeleteProduct(product._id)}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={handleAddToCart}
            >
              Ajouter au Panier
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">Update Product</h2>
            <input
              type="text"
              name="name"
              value={updatedProduct.name}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              className="w-full p-2 border rounded bg-gray-700 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Product Name"
            />
            <input
              type="number"
              name="price"
              value={updatedProduct.price}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
              className="w-full p-2 border rounded bg-gray-700 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Price"
            />
            <input
              type="text"
              name="image"
              value={updatedProduct.image}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
              className="w-full p-2 border rounded bg-gray-700 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Image URL"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-gray-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => handleUpdateProduct(product._id, updatedProduct)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fix prop validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.number.isRequired,
  }).isRequired,
  userRole: PropTypes.string,
};

// Only use one approach for default props
ProductCard.defaultProps = {
  userRole: 'User',
};

export default ProductCard;