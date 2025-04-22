import express from 'express';
import { Register, Login, googleAuth } from '../Controller/AuthController.js';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Regular authentication routes
router.post("/register", Register);
router.post("/login", Login);

// Google Auth route (for One Tap/button)
router.post("/auth/google", googleAuth);

// Traditional OAuth routes (redirect flow - optional)
router.get("/auth/google/callback",()=>console.log("heeeeeeey"), passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL, 
    failureRedirect: "/login/failed"
}));

router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));

// OAuth status routes
router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true, user: req.user });
    } else {
        res.status(403).json({ success: false, message: "Not authenticated" });
    }
});

router.get("/login/failed", (req, res) => {
    res.status(401).json({message: "Login failed"});
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error logging out" });
        }
        res.redirect(process.env.CLIENT_URL);
    });
});

export default router;