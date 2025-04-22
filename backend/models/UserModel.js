import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  country: { type: String },
  gender: { type: String },
  password: { type: String },
  role: { type: String, default: 'user' },
  // Google Auth fields
  googleId: { type: String, unique: true, sparse: true },
  isGoogleAuth: { type: Boolean, default: false },
  // Optional fields you might want from Google
}, { timestamps: true });

// Add method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;