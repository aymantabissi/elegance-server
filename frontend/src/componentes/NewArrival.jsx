 
import { Link } from "react-router-dom";
 function NewArrival() {
    return (
           <div className="max-w-7xl mx-auto text-center px-6 md:px-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 text-transparent bg-clip-text mb-8">New Arrival</h2>
        
          <div className="flex mb-12 space-x-8">
            {/* PlayStation 5 Section */}
            <div className="relative w-1/2 bg-gray-100 p-4 rounded-lg shadow-lg">
              <img
                src="https://images.bfmtv.com/McGgoNpdrBoP9QAbQA8EpWicZAQ=/1x7:1169x664/1168x0/images/PS5-Pro-1934260.jpg"
                alt="PS5 Pro"
                className="w-full h-[700px] object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                <p>PlayStation 5</p>
              </div>
              <div className="absolute bottom-8 left-4">
                <Link to="/shop" className="text-blue-600 font-semibold hover:underline">
                  Shop Now
                </Link>
              </div>
            </div>
        
            {/* Women’s Collection Section */}
            <div className="w-1/2 bg-gray-100 p-4 rounded-lg shadow-lg">
              <div className="relative mb-12">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpFPL6heLpVwoA-2hzYmd4f42j_OgiKWd2Nw&s"
                  alt="Wide Product Image"
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  <p>Women’s Collection</p>
                </div>
                <div className="absolute bottom-8 left-4">
                  <Link to="/shop" className="text-blue-600 font-semibold hover:underline">
                    Shop Now
                  </Link>
                </div>
              </div>
        
              {/* Additional Collection Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Parfums Collection Section */}
                <div className="relative">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw9dSwowHTRrVLe4UzgEJNll4A4pRco2BJsA&s"
                    alt="Women’s Collection"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                    <p>Parfums Collections</p>
                  </div>
                  <div className="absolute bottom-8 left-4">
                    <Link to="/shop" className="text-blue-600 font-semibold hover:underline">
                      Shop Now
                    </Link>
                  </div>
                </div>
        
                {/* New Collection Section */}
                <div className="relative">
                  <img
                    src="https://billionnaire.ma/cdn/shop/files/06.png?v=1727186519&width=533"
                    alt="New Collection"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                    <p>New Collection</p>
                  </div>
                  <div className="absolute bottom-8 left-4">
                    <Link to="/shop" className="text-blue-600 font-semibold hover:underline">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
    );}

export default NewArrival;