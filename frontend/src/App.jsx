import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import CreateProduct from '../views/CreateProduct.jsx';
import Navbar from './componentes/Navbar';
import Footer from './componentes/Footer';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Panier from './Pages/Panier';
import Details from './Pages/Details';
import { ToastContainer } from "react-toastify";
import UpdateProduct from '../views/UpdateProduct.jsx'
import Checkout from './Pages/Checkout';
import Payment from './Pages/payment.jsx';
import Dashbord from '../views/Dashbord.jsx';
import {PrivateRoute} from './componentes/PrivateRoute .jsx' // Fixing typo here
import Profile from './Pages/Profile.jsx';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe
import { Elements } from '@stripe/react-stripe-js'; // Import Elements

// Initialize stripePromise with your public key
const stripePromise = loadStripe('pk_test_51RCpHXPVTC7Tcc713PJQeFH3wfHtc75yQ3UnDUa0hdrb1JAxzMKuT7ZtAN4BZBgsVw0i0fHrz0rRWf1xOFYityXJ00l4xtUUiC'); // Replace with your actual key

function App() {
  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Wrap the Routes with Elements */}
      <Elements stripe={stripePromise}>
        <Routes>
          {/* Home should always be public */}
          <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect "/" to "/home" */}
          <Route path="/home" element={<Home />} /> {/* Public Home page */}

          {/* Admin routes (with private route protection) */}
          <Route path='/admin/CreateProduct' element={<PrivateRoute element={<CreateProduct />} roles={["admin"]} />} />
          <Route path='/admin/update-product/:productId' element={<PrivateRoute element={<UpdateProduct />} roles={["admin"]} />} />

          {/* Public Routes */}
          <Route path='/About' element={<About />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/Panier' element={<Panier />} />
          <Route path="/product/:id" element={<Details />} />
          <Route path='/Contact' element={<Contact />} />
          <Route path='/Profile' element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />

          {/* Login route */}
          <Route path="/login" element={<Login />} />

          {/* Private route for dashboard, only accessible by admin and manager */}
          <Route path="/dashboard" element={<PrivateRoute element={<Dashbord />} roles={["admin", "manager"]} />} />
        </Routes>
      </Elements>

      <Footer />
    </div>
  );
}

export default App;
