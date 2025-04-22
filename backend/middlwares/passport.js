import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"; 

// Configuration de la stratégie Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback", // Match frontend expectation
    scope: ["profile", "email"]
  },
  function(accessToken, refreshToken, profile, callback) {
    callback(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user); // Sérialisation de l'utilisateur
});
passport.deserializeUser((user, done) => {
  done(null, user); // Désérialisation de l'utilisateur
});