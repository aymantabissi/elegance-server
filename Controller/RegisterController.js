
import Register from "../models/Register.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    try {
      const { name, age,  email, password ,role,country ,gender} = req.body;
  
      // Vérifier si tous les champs sont remplis
      if (!name || !email || !password || !role || !country  || !age || !gender) {
        return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
      }
  
      // Vérifier si l'utilisateur existe déjà
      const userExists = await Register.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
      }
  
      // Hasher le mot de passe avant de l'enregistrer
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Créer un nouvel utilisateur
      const newUser = new Register({ name,role, country,age,gender, email, password: hashedPassword });
  
      await newUser.save();
      const token = jwt.sign(
        {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          age: newUser.age,
          gender: newUser.gender,
          country: newUser.country,
        },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "7d" }
      );
      
      res.status(201).json({ success: true, message: "Utilisateur enregistré avec succès", token });
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error.message);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };

  export const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await Register.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "Aucun compte trouvé avec cet email" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Mot de passe incorrect" });
      }
  
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          gender: user.gender,
          country: user.country,
        },
        process.env.JWT_SECRET || "secretkey", // عوضها بـ secret ديالك فـ .env
        { expiresIn: "7d" }
      );
      
      res.status(200).json({ success: true, token });    } catch (error) {
      console.error("Erreur lors de la connexion :", error.message);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };
