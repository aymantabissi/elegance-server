import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verify token validity
  const verifyToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Debug token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        console.log("DEBUG: Token contents:", decoded);
      } catch (err) {
        console.error("ERROR: Token decode failed:", err);
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (verifyToken()) {
      const decoded = jwt_decode(localStorage.getItem("token"));
      navigate(decoded.role === "admin" ? "/dashboard" : "/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("❌ Veuillez remplir tous les champs !");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = response.data;
      if (!token) {
        toast.error("❌ Token not received!");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      const decodedToken = jwt_decode(token);

      toast.success(`✅ Connexion réussie ! ${decodedToken.role === "admin" ? "Bienvenue administrateur." : ""}`);
      setTimeout(() => navigate(decodedToken.role === "admin" ? "/dashboard" : "/home"), 2000);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "❌ Erreur lors de la connexion !";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      console.log("Google credential received:", credentialResponse);

      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        { credential: credentialResponse.credential }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      const decodedToken = jwt_decode(token);
      toast.success(`✅ Connexion Google réussie ! ${decodedToken.name ? `Bienvenue ${decodedToken.name}` : ''}`);

      setTimeout(() => {
        navigate(decodedToken.role === "admin" ? "/dashboard" : "/home");
      }, 2000);
    } catch (error) {
      console.error("Google login error:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "❌ Connexion Google échouée";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    console.log("Google login failed");
    toast.error("❌ La connexion avec Google a échoué");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/891/891419.png"
            alt="E-Commerce Logo"
            className="w-16 mx-auto mb-3"
          />
          <h2 className="text-3xl font-extrabold text-gray-700">Connexion</h2>
          <p className="text-gray-500">Accédez à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-600 font-medium">Email</label>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium">Mot de passe</label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 mt-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            }`}
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="w-full border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500">ou</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={"95872693443-5hbop4agfons9mhdf5521glk04rgdo5d.apps.googleusercontent.com"}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              cookiePolicy={'single_host_origin'}
              locale="fr"
              text="continue_with"
              shape="rectangular"
              size="large"
              width="350"
            />
          </GoogleOAuthProvider>
        </div>

        <p className="text-center text-gray-600 mt-4">
          Nouveau client ?{" "}
          <Link 
            to="/Register" 
            className="text-blue-600 hover:underline font-semibold"
          >
            Créez un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;