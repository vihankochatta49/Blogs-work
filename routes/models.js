const mongoose = require("mongoose");
const slugify = require("slugify");
const markdown = require("markdown").markdown;

//schema for blog posts
const schema = new mongoose.Schema({
  name: String,
  slugName: String,
  registerNumber: Number,
  blogNumber: Number,
  title: String,
  slug: { type: String },
  description: String,
  date: { type: Date, default: Date.now() },
  createdAt: String,
  markdown: String,
  sanitizedHtml: { type: String, required: true },
  likes: { type: Number, default: 0 },
  roomName: String,
  filename: {
    type: String,
    unique: true,
  },
  contentType: String,
  imageBase64: String,
});

//pre validation
schema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title); //slugify title for urls
  }

  if (this.markdown) {
    this.sanitizedHtml = markdown.toHTML(this.markdown); //converting text to raw html
  }

  if (this.date) {
    var tarikh = new Date(this.date);
    // this.createdAt = tarikh.toDateString();
    var d = tarikh.getDate();
    var m = tarikh.getMonth() + 1;
    var y = tarikh.getFullYear();
    this.createdAt = d + "/" + m + "/" + y;
  }

  if (this.name) {
    this.slugName = slugify(this.name);
  }
  next();
});

module.exports = new mongoose.model("Blog", schema);
