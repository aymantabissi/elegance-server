import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFilter, FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";

function SidebarProductFilter({ 
  products, 
  setFilteredProducts, 
  categories = [],
  defaultCategory = "all"
}) {
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  
  // Derived states for UI
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Initialize price range from products when they load
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(product => product.price);
      const minProductPrice = Math.floor(Math.min(...prices));
      const maxProductPrice = Math.ceil(Math.max(...prices));
      
      setMinPrice(minProductPrice);
      setMaxPrice(maxProductPrice);
      setPriceRange({ min: minProductPrice, max: maxProductPrice });
    }
  }, [products]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (!products) return;
    
    const filtered = products.filter(product => {
      const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;
      const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
      const ratingMatch = product.rating >= minRating;
      
      return priceMatch && categoryMatch && ratingMatch;
    });
    
    setFilteredProducts(filtered);
  }, [priceRange, selectedCategory, minRating, products, setFilteredProducts]);

  // Reset all filters
  const resetFilters = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedCategory("all");
    setMinRating(0);
  };

  // Toggle filters visibility (for mobile)
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4 transition-all duration-200 hover:shadow-md">
      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-orange-400 to-red-500 rounded-full mr-3"></span>
          Catégories
        </h3>
        <div className="space-y-1">
          {[
            { name: "Mode féminine", path: "/category/feminine" },
            { name: "Mode masculine", path: "/category/masculine" },
            { name: "Électronique", path: "/category/electronics" },
            { name: "Maison et lifestyle", path: "/category/home" },
            { name: "Médecine", path: "/category/medicine" },
            { name: "Sports et plein air", path: "/category/sports" },
            { name: "Bébés et jouets", path: "/category/baby" },
            { name: "Épicerie et animaux", path: "/category/grocery" },
            { name: "Santé et beauté", path: "/category/health" }
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
            >
              <span className="text-gray-700 group-hover:text-orange-600">{item.name}</span>
              <span className="text-gray-400 group-hover:text-orange-500">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Space between categories and filters - 500px */}
      <div className="h-[750px]"></div>

      {/* Filter header with toggle */}
      <div 
        className="flex justify-between items-center mb-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={toggleFilters}
      >
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg mr-3">
            <FaFilter className="text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
        </div>
        {showFilters ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </div>
      
      {/* Filter content */}
      {showFilters && (
        <div className="space-y-6 border-t border-gray-100 pt-4">
          {/* Category Filter */}
          <div>
            <h4 className="font-medium mb-3 text-gray-700">Catégorie</h4>
            <div className="space-y-2">
              <div 
                className={`cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedCategory === "all" 
                    ? "bg-gradient-to-r from-orange-100 to-red-50 text-orange-600 border border-orange-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                Toutes les catégories
              </div>
              {categories.map((category) => (
                <div 
                  key={category} 
                  className={`cursor-pointer p-3 rounded-lg transition-colors ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-orange-100 to-red-50 text-orange-600 border border-orange-200" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <h4 className="font-medium mb-3 text-gray-700">Prix (€)</h4>
            <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
              <span>Min: €{priceRange.min}</span>
              <span>Max: €{priceRange.max}</span>
            </div>
            <div className="mb-4">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">€</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="border border-gray-200 rounded-lg px-3 pl-8 py-2 w-full focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">€</span>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={maxPrice}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="border border-gray-200 rounded-lg px-3 pl-8 py-2 w-full focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <h4 className="font-medium mb-3 text-gray-700">Évaluation minimale</h4>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <FaStar
                    key={rating}
                    className={`cursor-pointer text-xl mx-1 ${
                      rating <= minRating ? "text-yellow-400" : "text-gray-300"
                    } transition-transform hover:scale-125`}
                    onClick={() => setMinRating(rating)}
                  />
                ))}
              </div>
              {minRating > 0 && (
                <button 
                  className="ml-3 text-sm text-orange-500 hover:text-orange-600 transition-colors"
                  onClick={() => setMinRating(0)}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-4">
            <button
              onClick={resetFilters}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-red-600"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarProductFilter;