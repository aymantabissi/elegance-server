import express from 'express';
import { verifyToken } from '../middlwares/AuthMiddlwares.js';
import { updateProfile,getUserProfile,upload } from '../Controller/UserController.js';
  // استيراد الـ controller

const router = express.Router();

// Route لتحديث الملف الشخصي
router.get('/profile', verifyToken, getUserProfile);

// PUT /api/users/profile
router.put('/profile', verifyToken,upload.single('profileImage'), updateProfile);

  

export default router;
