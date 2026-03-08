import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams import
import { useProductStore } from "../src/store/product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdateProduct() {
  const { productId } = useParams();  // Use useParams hook here
  const navigate = useNavigate();

  // Ensure the productId is available, else redirect
  if (!productId) {
    toast.error("Product ID is missing!");
    navigate("/dashboard");
    return null;
  }

  const { fetchProductById, updateProduct } = useProductStore();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null,
  });
  const [loading, setLoading] = useState(true);

  // Load product data by ID
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await fetchProductById(productId);
        if (productData) {
          setProduct(productData);  // Set the product data into state
        } else {
          toast.error("Product not found");
          navigate("/dashboard");  // Redirect if product not found
        }
      } catch (error) {
        toast.error("Failed to fetch product");
        navigate("/dashboard");  // Redirect on error
      }
      setLoading(false);
    };

    loadProduct();
  }, [productId, fetchProductById, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProduct((prevProduct) => ({ ...prevProduct, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("category", product.category);
      if (product.image) {
        formData.append("image", product.image); // Include image if available
      }

      const response = await updateProduct(productId, formData); // Send FormData here
      if (response.success) {
        toast.success("Product updated successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred while updating the product");
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Update Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleInputChange}
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
              placeholder="Enter product price"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={product.category}
              onChange={handleInputChange}
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
              required
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="beauty">Beauty</option>
              <option value="sports">Sports</option>
              <option value="fashion">Fashion</option>
            </select>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleInputChange}
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full h-32"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
            />
            {product.image && <p className="mt-2 text-sm text-gray-600">Selected image: {product.image.name}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;
