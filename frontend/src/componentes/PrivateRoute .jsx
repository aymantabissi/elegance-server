import { Navigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import PropTypes from "prop-types"; // Import PropTypes

export const PrivateRoute = ({ element, roles = [], ...rest }) => {
  const token = localStorage.getItem('token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Decode token to get user role
  let decodedToken;
  try {
    decodedToken = jwt_decode(token);
  } catch (error) {
    return <Navigate to="/login" />;
  }

  // If the user doesn't have the required role, redirect to Home or a fallback page
  if (roles.length > 0 && !roles.includes(decodedToken.role)) {
    return <Navigate to="/" />;
  }

  // If everything is fine, render the element
  return element; // Render the passed component directly
};

// Add PropTypes validation
PrivateRoute.propTypes = {
  element: PropTypes.node.isRequired,  // This ensures 'element' is a valid JSX component
  roles: PropTypes.array,              // 'roles' is an array, no default required
};

export default PrivateRoute;
