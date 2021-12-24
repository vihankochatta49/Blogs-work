const express = require("express");
const a = require("./../routes/models");
const userData = require("./../routes/registerModels");
const { ensureAuthenticated } = require("../config/auth");
const router = express.Router();

//for home page
router.get("/feed", ensureAuthenticated, async (req, res) => {
  const profile = req.user;
  const article = await a.find();
  res.render("feed", { profile, article });
});

//profile route
router.get("/:name/:registerNumber", ensureAuthenticated, async (req, res) => {
  const blogs = await a.find({
    registerNumber: req.params.registerNumber,
  });
  const num = await userData.findOne({
    registerNumber: req.params.registerNumber,
  });
  res.render("dashboard", { blogs, num });
});

//others profile route
router.get(
  "/other-profile/:name/:registerNumber",
  ensureAuthenticated,
  async (req, res) => {
    const blogs = await a.find({
      registerNumber: req.params.registerNumber,
    });
    const num = await userData.findOne({
      registerNumber: req.params.registerNumber,
    });
    res.render("otherProfile", { blogs, num });
  }
);

//for read more
router.get("/readMore/:slug/:blogNumber", async (req, res) => {
  const article = await a.findOne({ blogNumber: req.params.blogNumber });
  if (article != null) res.render("show", { article: article });
  else res.redirect("/");
});

//for comment section
router.get("/comment/:slug/:blogNumber/:registerNumber", async (req, res) => {
  const art = await a.findOne({ blogNumber: req.params.blogNumber });
  const num = await userData.findOne({
    registerNumber: req.params.registerNumber,
  });
  if (art != null) res.render("comment", { art, num });
  else res.redirect("/");
});

//for creating new blog
router.get("/new-article/create/:registerNumber", async (req, res) => {
  const registeredUser = await userData.findOne({
    registerNumber: req.params.registerNumber,
  });
  res.render("create", { registeredUser });
});

//for edit
router.get("/edit/:slug/:blogNumber", async (req, res) => {
  const article = await a.findOne({ blogNumber: req.params.blogNumber });
  if (article == null) res.redirect("/");
  else res.render("edit", { article: article });
});

//for delete
router.delete("/:id", async (req, res) => {
  await a.findByIdAndDelete(req.params.id);
  res.redirect("/feed");
});

module.exports = router;
