const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: false }, // Make password not required for OAuth users
  googleId: { type: String, unique: true, sparse: true },
  thumbnail: String, // Optional for storing user profile picture URL
  businessCategory: { type: String },
  businessDescription: { type: String }
});

userSchema.pre('save', function(next) {
  // Only hash the password if it has been modified (or is new) and not empty
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return next(err);
      }
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;