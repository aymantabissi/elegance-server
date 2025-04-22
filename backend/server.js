import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import stripePkg from "stripe";
import { ConnectDB } from "./config/db.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import AiRoutes from "./routes/AiRoutes.js";
import userRoutes from "./routes/Profile.js";
import actionRoutes from "./routes/actionRoutes.js"
import ProfileRoutes from "./routes/Profile.js";
import passport from "passport";
import session from 'express-session';


// Setup
dotenv.config();
const stripe = stripePkg(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(session({
  secret: 'ton_secret', // Utilise une clé secrète pour signer les sessions
  resave: false,        // Ne pas resauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: false, // Ne pas sauvegarder les sessions non initialisées
  cookie: { secure: false } // Utilise true si tu as un environnement HTTPS
}));

app.use(passport.initialize()); // Initialize passport for authentication
app.use(passport.session()); // Initialize session support for passport

// API routes
app.use("/api/products", ProductRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", UserRoutes);
app.use("/api", AuthRoutes);
app.use("/api", AiRoutes);
app.use("/api/user", userRoutes); 
app.use('/api/users', ProfileRoutes);


app.use("/", actionRoutes);

// ✅ STRIPE PAYMENT ROUTE
app.post("/api/payments/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Image route
app.get("/uploads/:image", (req, res) => {
  const imagePath = path.join(__dirname, "uploads", req.params.image);
  fs.exists(imagePath, (exists) => {
    if (exists) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send("Image not found");
    }
  });
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});



// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await ConnectDB();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
