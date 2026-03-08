import { useEffect, useState } from "react";
import { useProductStore } from "../store/product";
import ProductCard from "../componentes/ProductCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";
import { CiDeliveryTruck } from "react-icons/ci";
import { FaHeadphonesAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GrValidate } from "react-icons/gr";
import NewArrival from "../componentes/NewArrival";
import Pagination from "../componentes/Pagination";
import SidebarProductFilter from "../componentes/ProductFilter";

function Home() {
  // State and store hooks
  const { fetchProduct, products } = useProductStore();
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [searchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [personalizedPage, setPersonalizedPage] = useState(0);
  const personalizedPerPage = 4;
  const [filteredThisMonthProducts, setFilteredThisMonthProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Banner slides data
  const bannerSlides = [
    {
      id: 1,
      title: "Jusqu'à 10% de réduction",
      subtitle: "Série iPhone 14",
      buttonText: "Achetez maintenant",
      image: "https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/tile/Apple-iPhone-16-Pro-hero-geo-240909-lp.jpg.landing-big_2x.jpg",
      bgColor: "bg-gray-900",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Nouveaux arrivages",
      subtitle: "Collection Été 2025",
      buttonText: "Découvrir",
      image: "https://static.wixstatic.com/media/2cb441_f01d01c1775241b2a12a00c96260e46f~mv2.jpg/v1/fill/w_568,h_426,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/2cb441_f01d01c1775241b2a12a00c96260e46f~mv2.jpg",
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "Offres spéciales",
      subtitle: "Livraison gratuite",
      buttonText: "En savoir plus",
      image: "https://shop-ta-box.com/wp-content/uploads/2024/01/Blissim-720x405.jpg",
      bgColor: "bg-red-600",
      textColor: "text-white",
    },
    {
      id: 4,
      title: "Nouveautés tech",
      subtitle: "Découvrez nos gadgets",
      buttonText: "Explorer",
      image: "https://cdn.prod.website-files.com/63af1964cee58c25c01c102f/6401d387af638fda8c374a1d_happy-african-shopaholic-woman-choosing-clothes-po-2022-12-16-06-33-24-utc-min.jpg",
      bgColor: "bg-purple-600",
      textColor: "text-white",
    },
    {
      id: 5,
      title: "Collection limitée",
      subtitle: "Jusqu'à épuisement des stocks",
      buttonText: "Acheter maintenant",
      image: "https://www.shutterstock.com/image-photo/close-male-female-athlete-standing-260nw-1871076034.jpg",
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
  ];

  // Personalized products pagination
  const paginatedPersonalized = personalizedProducts.slice(
    personalizedPage * personalizedPerPage,
    (personalizedPage + 1) * personalizedPerPage
  );

  const nextPersonalized = () => {
    setPersonalizedPage((prev) =>
      (prev + 1) * personalizedPerPage >= personalizedProducts.length
        ? 0
        : prev + 1
    );
  };

  const prevPersonalized = () => {
    setPersonalizedPage((prev) =>
      prev === 0
        ? Math.floor((personalizedProducts.length - 1) / personalizedPerPage)
        : prev - 1
    );
  };

  // Banner carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Check user authentication and role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUserRole(decoded.role);
        
        let userAge = decoded.age;
        if (typeof userAge === 'string') {
          userAge = parseInt(userAge, 10);
        }
        
        if (userAge && decoded.gender && decoded.country) {
          fetch("http://localhost:5001/personalized-recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              age: userAge,
              gender: decoded.gender,
              country: decoded.country
            }),
          })
          .then(response => {
            if (!response.ok) {
              return response.text().then(text => {
                throw new Error(`Server error: ${response.status}`);
              });
            }
            return response.json();
          })
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setPersonalizedProducts(data);
            }
          })
          .catch(err => {
            console.error("ERROR: Failed to fetch recommendations:", err);
          });
        }
      } catch (err) {
        console.error("ERROR: Failed to process token for recommendations:", err);
      }
    }
  }, []);

  // Fetch products if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      setLoading(true);
      fetchProduct()
        .then(() => setLoading(false))
        .catch(() => {
          setLoading(false);
          setError("Failed to load products");
        });
    }
  }, [fetchProduct, products.length]);

  // Filter products based on search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const filtered = products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, products]);

  // Extract categories and set initial filtered products
  useEffect(() => {
    if (products.length > 0) {
      const categories = [...new Set(products.map(product => product.category))];
      setAllCategories(categories);
      setFilteredThisMonthProducts(products);
    }
  }, [products]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.length > 0
    ? filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    : filteredThisMonthProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil((filteredProducts.length > 0 ? filteredProducts.length : filteredThisMonthProducts.length) / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col md:flex-row">
        {/* Left side categories - Hidden on mobile */}
        <div className="hidden md:block md:w-1/5 border-r border-gray-200 p-4 bg-white">
          <div className="mt-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 text-transparent bg-clip-text mb-4">
              Filtrer les produits
            </h2>
            <SidebarProductFilter 
              products={products}
              setFilteredProducts={setFilteredThisMonthProducts}
              categories={allCategories}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-4/5">
          {/* Banner carousel */}
          <div className="relative overflow-hidden h-64 md:h-96 rounded-lg mx-4 mt-4 shadow-lg">
            {bannerSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`absolute w-full h-full transition-opacity duration-500 flex items-center ${slide.bgColor} ${slide.textColor} ${
                  index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                ></div>

                <div className="container mx-auto px-6 md:px-12 flex items-center relative z-10">
                  <div className="w-full md:w-1/2 bg-black bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
                    <h3 className="text-xl md:text-2xl font-light mb-2">{slide.subtitle}</h3>
                    <h2 className="text-3xl md:text-5xl font-bold my-2 leading-tight">{slide.title}</h2>
                    <button className="mt-4 px-6 py-3 bg-white text-gray-900 font-medium rounded-full flex items-center hover:bg-gray-100 transition duration-300 shadow-md">
                      {slide.buttonText}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-3 z-10 transition duration-300"
              aria-label="Previous slide"
            >
              <FaArrowLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-3 z-10 transition duration-300"
              aria-label="Next slide"
            >
              <FaArrowRight className="h-6 w-6" />
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition duration-300 ${
                    index === currentSlide ? "bg-white w-6" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Products section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Get Started Message */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 py-12 rounded-xl shadow-inner mb-12">
              <div className="text-center max-w-3xl mx-auto">
                {!userRole ? (
                  <>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 text-transparent bg-clip-text mb-4">
                      Explore Our Popular Products
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      We have a wide selection of quality items. Click below to start exploring!
                    </p>
                    <Link 
                      to="/register" 
                      className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition duration-300 hover:from-orange-600 hover:to-red-600"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back!</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Start exploring personalized product recommendations just for you.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Personalized Recommendations Section */}
            {personalizedProducts && personalizedProducts.length > 0 && (
              <div className="mt-16 relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 text-transparent bg-clip-text">
                    Pour Vous
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={prevPersonalized}
                      className="bg-white shadow rounded-full p-3 hover:bg-gray-100 transition duration-300"
                      aria-label="Previous recommendations"
                    >
                      <FaArrowLeft className="text-lg text-gray-700" />
                    </button>
                    <button
                      onClick={nextPersonalized}
                      className="bg-white shadow rounded-full p-3 hover:bg-gray-100 transition duration-300"
                      aria-label="Next recommendations"
                    >
                      <FaArrowRight className="text-lg text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedPersonalized.map((product) => (
                    <ProductCard key={product._id} product={product} userRole={userRole} />
                  ))}
                </div>
              </div>
            )}

            {/* This Month Products */}
            <div className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 text-transparent bg-clip-text">
                  This Month
                </h2>
                {filteredProducts.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {filteredProducts.length} products found
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product._id} product={product} userRole={userRole} />
                ))}
              </div>

              {/* Pagination */}
              {pageNumbers.length > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    pageNumbers={pageNumbers}
                    paginate={paginate}
                  />
                </div>
              )}
            </div>

            {/* New Arrivals */}
            <div className="mt-16">
              <NewArrival />
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-xl shadow-md p-8 mt-12">
              <div className="text-center p-6 hover:bg-gray-50 rounded-lg transition duration-300">
                <div className="bg-orange-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <CiDeliveryTruck className="w-8 h-8 text-orange-500" />
                </div>
                <h4 className="font-bold text-lg mb-2">FREE AND FAST DELIVERY</h4>
                <p className="text-gray-600">Free delivery for all orders over $140</p>
              </div>
              <div className="text-center p-6 hover:bg-gray-50 rounded-lg transition duration-300">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <FaHeadphonesAlt className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="font-bold text-lg mb-2">24/7 CUSTOMER SERVICE</h4>
                <p className="text-gray-600">Friendly 24/7 customer support</p>
              </div>
              <div className="text-center p-6 hover:bg-gray-50 rounded-lg transition duration-300">
                <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <GrValidate className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="font-bold text-lg mb-2">MONEY BACK GUARANTEE</h4>
                <p className="text-gray-600">We return money within 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;