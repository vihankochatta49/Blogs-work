const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../routes/registerModels");
var registerNumber = Math.floor(Math.random() * 1000000000);

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "195118986970-6sr88jhohv2hm9c6b484gpci44ocook7.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        {
          name: profile.displayName,
          email: profile.email,
          provider: "GOOGLE",
          registerNumber: registerNumber,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
