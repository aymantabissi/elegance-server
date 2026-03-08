import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5";
import { BsBox, BsXCircle } from "react-icons/bs";
import { AiOutlineLogout, AiOutlineStar } from "react-icons/ai";

const UserDropdown = ({ isDropdownOpen, handleLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Check for JWT token and decode user info
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          // Decode JWT payload (middle part of token)
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Check if token is expired
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            
            // Extract user data from token
            setUserData({
              name: payload.name || payload.username || "User",
              email: payload.email || "",
              avatar: payload.avatar || "https://www.w3schools.com/howto/img_avatar.png"
            });
          } else {
            // Token expired
            setIsAuthenticated(false);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error parsing JWT token:", error);
          setIsAuthenticated(false);
          setUserData(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    };
    
    checkAuth();
  }, [isDropdownOpen]); // Re-check when dropdown opens

  // Default user info
  const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";
  const userName = userData?.name || "Guest";
  const userEmail = userData?.email || "";

  return (
    <>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-50">
          {/* User info display */}
          <div className="px-4 py-2 text-center">
            <img
              src={userData?.avatar || defaultAvatar}
              alt="user-avatar"
              className="w-12 h-12 rounded-full mx-auto mb-2"
            />
            {isAuthenticated ? (
              <>
                <p className="font-bold">{userName}</p>
                <p className="text-gray-500 text-sm">{userEmail}</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Please log in</p>
            )}
          </div>

          {/* Dropdown options based on authentication status */}
          {!isAuthenticated ? (
            // Not connected - show login option
            <Link to="/login" className="flex items-center px-4 py-2 hover:bg-gray-100 transition">
              <AiOutlineLogout className="mr-3" /> Login
            </Link>
          ) : (
            // Connected - show all user options
            <>
              <Link to="/Profile" className="flex items-center px-4 py-2 hover:bg-gray-100 transition">
                <IoPersonOutline className="mr-3" /> Mon compte
              </Link>
              <Link to="/orders" className="flex items-center px-4 py-2 hover:bg-gray-100 transition">
                <BsBox className="mr-3" /> Mes commandes
              </Link>
              <Link to="/cancellations" className="flex items-center px-4 py-2 hover:bg-gray-100 transition">
                <BsXCircle className="mr-3" /> Annulations
              </Link>
              <Link to="/reviews" className="flex items-center px-4 py-2 hover:bg-gray-100 transition">
                <AiOutlineStar className="mr-3" /> Avis
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-red-500 hover:bg-gray-100 transition"
              >
                <AiOutlineLogout className="mr-3" /> Déconnexion
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Updated PropTypes validation
UserDropdown.propTypes = {
  isDropdownOpen: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired
};

export default UserDropdown;