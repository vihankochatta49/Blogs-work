const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const nodemailer = require("nodemailer");
const rM = require(".././routes/registerModels");
const a = require(".././routes/models");

// saving register data to db (post route)
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check require fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  //password check
  if (password !== password2) errors.push({ msg: "Password do not match" });

  //check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters long" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    rM.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        //register number
        var registerNumber = Math.floor(Math.random() * 1000000000);

        const createDoc = async function () {
          try {
            const userData = new rM({
              name: req.body.name,
              email: req.body.email,
              password: req.body.password,
              registerNumber: registerNumber,
            });

            // generating hashed password
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            userData.password = hashedPassword;
            const user = await rM.insertMany([userData]);
            console.log(user);

            var otp = Math.floor(Math.random() * 1000000);

            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "vihankochatta49@gmail.com",
                pass: "vihankoc",
              },
            });

            var mailOptions = {
              from: "vihankochatta49@gmail.com",
              to: req.body.email,
              subject: "OTP request for blog site",
              text: `Your one time password is: ${otp}`,
            };

            console.log(mailOptions.text);

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent");
              }
            });

            if (otp == req.body.otp) {
              req.flash(
                "success_msg",
                "You have successfully registered and can login in"
              );
              res.redirect("/");
            } else {
              req.flash("error_msg", "Invalid OTP");
              res.redirect("/register");
            }
          } catch (err) {
            console.log(err);
          }
        };
        createDoc();
      }
    });
  }
});

//post route for login (passport authenticate)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);
});

//logout handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

module.exports = router;
