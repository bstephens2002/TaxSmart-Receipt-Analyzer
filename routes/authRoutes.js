const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

// router.get('/receipts/upload', (req, res) => {
//   res.render('upload');
// });

// router.post('/receipts/upload', (req, res) => {
//   res.render('upload');
// });

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, businessCategory, businessDescription } = req.body;
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password, businessCategory, businessDescription });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});
router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      req.session.businessCategory = user.businessCategory;
      req.session.businessDescription = user.businessDescription;
      return res.redirect('/');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Error logging out');
    }
    req.session.destroy(() => {
      res.redirect('/auth/login'); // Redirect to login page after logout
    });
  });
});

// Route for redirecting to Google for authentication
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'] // Added 'email' to the scope for Google OAuth
  })
);

// Callback route for Google to redirect to
router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  // Successful authentication, redirect home.
  req.login(req.user, (err) => { // Ensuring the user is logged in after successful authentication
    if (err) {
      console.error('Error during login after Google OAuth:', err);
      return res.status(500).send('Error during login process');
    }
    res.redirect('/');
  });
});

module.exports = router;