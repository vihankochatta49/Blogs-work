const express = require("express");
const a = require("./../routes/models");
const userData = require("./../routes/registerModels");
const router = express.Router();

//for home page
router.get("/feed", async (req, res) => {
  console.log(req.user);
  const profile = req.user;
  const article = await a.find();
  res.render("feed", { profile, article });
});

//for read more
router.get("/readMore/:slug/:blogNumber", async (req, res) => {
  const article = await a.findOne({ blogNumber: req.params.blogNumber });
  if (article != null) res.render("show", { article: article });
  else res.redirect("/");
});

//for comment section
router.get("/comment/:slug/:blogNumber", async (req, res) => {
  const art = await a.findOne({ blogNumber: req.params.blogNumber });
  if (art != null) res.render("comment", { art: art });
  else res.redirect("/");
});

//profile route
router.get("/:name/:registerNumber", async (req, res) => {
  const blogs = await a.find({
    resgisterNumber: req.params.registerNumber,
  });
  const num = req.params.registerNumber;
  res.render("dashboard", { blogs, num });
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
  res.redirect("/");
});

module.exports = router;
