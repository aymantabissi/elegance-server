import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const Register = async (req, res) => {
    try {
        const { name, age, country, email, gender, password, role } = req.body;

        // Check if user exists (either by email or googleId)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            age,
            gender,
            country,
            password: hashedPassword,
            role: role || "user",
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({ 
            message: "User registered successfully!",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong during registration" });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Check if user registered with Google
        if (user.isGoogleAuth) {
            return res.status(400).json({ 
                message: "This email is registered with Google. Please sign in with Google." 
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate token
        const token = generateToken(user);

        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Google Auth Controller
export const googleAuth = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ success: false, message: "No credential provided" });
    }
    
    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { email },
                { googleId }
            ]
        });

        if (!user) {
            // Create new user with Google auth
            user = new User({
                name,
                email,
                googleId,
                isGoogleAuth: true,
                picture,
                emailVerified: true,
                role: "user" // Default role
            });
            await user.save();
        } else if (!user.googleId) {
            // User exists but didn't use Google auth before
            // Link their existing account with Google
            user.googleId = googleId;
            user.isGoogleAuth = true;
            user.picture = picture;
            user.emailVerified = true;
            await user.save();
        }

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(401).json({ 
            success: false, 
            message: "Invalid Google token", 
            error: error.message 
        });
    }
};

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            age: user.age,
            country: user.country,
            gender: user.gender
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};