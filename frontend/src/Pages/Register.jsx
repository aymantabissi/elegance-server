import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    age: "",
    gender: "",
    country: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some(field => !field)) {
      toast.error("❌ Veuillez remplir tous les champs !");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/register", formData);
      toast.success("✅ Inscription réussie !");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Erreur lors de l'inscription !";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="md:flex">
            {/* Left Side - Visual */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex flex-col justify-center text-white">
              <div className="max-w-xs mx-auto">
                <h1 className="text-3xl font-bold mb-4">Rejoignez notre communauté</h1>
                <p className="text-blue-100 mb-8">
                  Créez votre compte et bénéficiez d`une expérience personnalisée avec des recommandations adaptées à votre profil.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full p-2 mr-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Recommandations personnalisées</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full p-2 mr-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Suivi de vos commandes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full p-2 mr-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Avantages exclusifs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="md:w-1/2 p-8 sm:p-12">
              <div className="text-center mb-8">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/891/891419.png"
                  alt="Logo"
                  className="w-16 mx-auto mb-4"
                />
                <h2 className="text-3xl font-extrabold text-gray-800">Créer un compte</h2>
                <p className="text-gray-500 mt-2">Commencez votre voyage avec nous</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Votre nom complet"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Votre âge"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Sélectionnez votre genre</option>
                      <option value="Male">Homme</option>
                      <option value="Female">Femme</option>
                      <option value="Other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Votre pays de résidence"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Votre adresse email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Créez un mot de passe sécurisé"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["user", "admin", "manager"].map((r) => (
                        <div 
                          key={r}
                          className={`border rounded-lg p-3 cursor-pointer transition ${formData.role === r ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"}`}
                          onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border mr-2 ${formData.role === r ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}></div>
                            <span className="capitalize">{r === "user" ? "Utilisateur" : r === "admin" ? "Administrateur" : "Manager"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    J`accepte les <a href="#" className="text-blue-600 hover:underline">conditions d`utilisation</a> et la <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-md hover:shadow-lg"
                >
                  Créer mon compte
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Ou continuez avec</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                      alt="Google"
                      className="w-5 h-5 mr-2"
                    />
                    Google
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Vous avez déjà un compte?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;