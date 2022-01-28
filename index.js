const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const a = require("./routes/models");
const app = express();
const port = process.env.PORT || 3000;

//passport config
require("./config/passport")(passport);

//google auth config
require("./config/googleAuth");

//ejs engine
app.set("view engine", "ejs");

//body parser
app.use(express.urlencoded({ extended: false }));

//method override
app.use(methodOverride("_method"));

// Connecting with database
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blogs")
  .then(() => console.log("Connection successful..."))
  .catch((err) => console.log(err));

// Socket connection for comments
const io = require("socket.io")(4202, { cors: { origin: "*" } });
const users = {};

//new user joined
io.on("connection", (socket) => {
  socket.on("new-user-joined", (room, name) => {
    socket.join(room);
    users[socket.id] = name;
    socket.to(room).emit("user-joined", name);
  });

  //user send message
  socket.on("send", (room, message) => {
    socket.to(room).emit("recieve", {
      message: message,
      name: users[socket.id],
    });
  });

  //user disconnected
  socket.on("disconnect", (message) => delete users[socket.id]);
});

//express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      expires: 1000000000000000,
    },
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//handles authentication with google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/feed",
    failureRedirect: "/auth/google/failure",
  })
);

//handle google auth failure
app.get("/auth/google/failure", (req, res) => {
  res.send("Failed to authenticate..");
});

//getting routes/new.js
app.use("/", require(path.join(__dirname, "routes/new")));

//getting routes/nav.js
app.use("/", require("./routes/nav"));

//getting routes/register.js
app.use("/", require("./routes/register"));

//404 page
app.get("*", (req, res) => {
  res.render("404Page");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
