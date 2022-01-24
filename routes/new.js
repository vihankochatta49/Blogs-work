const express = require("express");
const Article = require("./../routes/models");
const userData = require("./../routes/registerModels");
const markdown = require("markdown").markdown;
const router = express.Router();
const app = express();

//register route
router.get("/register", (req, res) => {
  res.render("register");
});

//login route
router.get("/", (req, res) => {
  res.render("login");
});

// saving blog to database
router.post("/save/:registerNumber", (req, res) => {
  //generating 9 digit blog number
  var blogNumber = Math.floor(Math.random() * 1000000000);

  const createDoc = async () => {
    try {
      const registeredUser = await userData.findOne({
        registerNumber: req.params.registerNumber,
      });
      const apprec = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        roomName: req.body.title,
        blogNumber: blogNumber,
        registerNumber: registeredUser.registerNumber,
        name: registeredUser.name,
      });
      const blog = await Article.insertMany([apprec]);
      res.redirect(`/readMore/${apprec.slug}/${apprec.blogNumber}`);
    } catch (err) {
      console.log(err);
    }
  };
  createDoc();
});

//updating blog
router.put("/:id", async (req, res) => {
  try {
    const art = Article.findById(req.params.id);

    await Article.updateMany(art, {
      $set: {
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        sanitizedHtml: markdown.toHTML(req.body.markdown),
      },
    });
    res.redirect("/feed");
  } catch (err) {
    console.log(err);
  }
});

//counting likes
router.put("/like/post/:id", (req, res) => {
  Article.findByIdAndUpdate(
    req.params.id,
    {
      $inc: { likes: 1 },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
