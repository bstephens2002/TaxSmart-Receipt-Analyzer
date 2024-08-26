const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our db
      const currentUser = await User.findOne({ googleId: profile.id });
      if (currentUser) {
        // Already have the user
        console.log('User is: ', currentUser);
        done(null, currentUser);
      } else {
        // If not, create user in our db
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          thumbnail: profile.photos[0].value // Assuming the user has a profile picture
        });
        console.log('New user created: ', newUser);
        done(null, newUser);
      }
    } catch (error) {
      console.error('Error processing Google OAuth login: ', error.message);
      console.error(error.stack);
      done(error, null);
    }
  }
));

// Serialize user into the sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser((id, done) => {
  User.findOne({_id: id}, (err, user) => {
    if (user) {
      done(null, user);
    } else {
      // If user not found by _id, try finding by googleId
      User.findOne({googleId: id}, (err, user) => {
        if (err) {
          console.error('Error deserializing user by googleId: ', err.message);
          console.error(err.stack);
        }
        done(err, user);
      });
    }
  }).catch((error) => {
    console.error('Error deserializing user: ', error.message);
    console.error(error.stack);
    done(error, null);
  });
});

