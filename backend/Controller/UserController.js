// controllers/userController.js
import User from "../models/UserModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Set up multer upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Get current user's profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user's profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle profile image if it was uploaded
    if (req.file) {
      // Remove old profile image if exists
      if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Set new profile image path
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user fields from form data or JSON body
    const updateData = req.body;
    
    // Basic fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.age) user.age = updateData.age;
    if (updateData.gender) user.gender = updateData.gender;
    if (updateData.country) user.country = updateData.country;
    
    // Shipping address
    if (updateData['shippingAddress.street'] || updateData.shippingAddress?.street) {
      user.shippingAddress = {
        street: updateData['shippingAddress.street'] || updateData.shippingAddress?.street || user.shippingAddress?.street,
        postalCode: updateData['shippingAddress.postalCode'] || updateData.shippingAddress?.postalCode || user.shippingAddress?.postalCode
      };
    }

    // Password change
    if (updateData.currentPassword && updateData.newPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = updateData.newPassword;
    }

    await user.save();
    
    // Return updated user (excluding password)
    const updatedUser = await User.findById(userId).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update routes to handle file upload
// Note: This is for reference, implement in your routes file
// router.put('/profile', protect, upload.single('profileImage'), updateProfile);