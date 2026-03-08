import { useState } from "react";
import { useProductStore } from "../src/store/product";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function CreateProduct() {
  const navigate = useNavigate();
  const [newProduct, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createProduct } = useProductStore();

  // Handle file selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category || !newProduct.description || !imageFile) {
      toast.error("Please fill all fields and select an image!");
      return;
    }
  
    setLoading(true); // Show loading indicator
  
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
    formData.append("category", newProduct.category);
    formData.append("description", newProduct.description);
    formData.append("image", imageFile); // Add image file to the form data
  
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData, // Send as FormData, not JSON
      });
  
      // Check if response is not a 2xx HTTP status code (successful)
      if (!res.ok) {
        const errorText = await res.text(); // Get error message (if any) from the response
        throw new Error(errorText);
      }
  
      const data = await res.json(); // Parse JSON response
  
      if (!data.success) {
        toast.error(data.message || "Error creating product");
      } else {
        toast.success("Product created successfully!");
        setTimeout(() => navigate("/Dashboard"), 2000);
      }
    } catch (error) {
      console.error("Error while creating product:", error);
      toast.error(error.message || "Error occurred while adding product");
    }
  
    setLoading(false); // Hide loading indicator
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col space-y-8 items-center w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Create New Product</h1>

        <div className="flex flex-col space-y-6 w-full">
          {/* Product Name */}
          <input
            className="input-field"
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Product Name"
          />

          {/* Price */}
          <input
            className="input-field"
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Price"
          />

          {/* Custom File Upload */}
          <div className="relative w-full h-40 border-2 border-dashed border-gray-400 rounded-lg flex justify-center items-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-300">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <p className="text-gray-600">Click or drag to upload</p>
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Selected"
                  className="w-32 h-32 object-cover mt-4 rounded"
                />
              )}
            </div>
          </div>

          {/* Stock Quantity */}
          <input
            className="input-field"
            type="number"
            name="stock"
            value={newProduct.stock}
            onChange={handleInputChange}
            placeholder="Stock Quantity"
          />

          {/* Category */}
          <input
            className="input-field"
            type="text"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            placeholder="Category"
          />

          {/* Product Description */}
          <textarea
            className="input-field h-24 resize-none"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder="Product Description"
          />

          {/* Submit Button */}
          <button
            className="bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition duration-300"
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;
