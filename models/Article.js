const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
  contributor: { type: String, required: true },
  addedText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  finalContent: { type: String, required: true }, // AI-refined version
});

const SectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true },
  content: { type: String, required: true },
  originalContent: { type: String, required: false },
  modifications: [ContributionSchema], // Stores history of modifications
});

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { name: String, image: String },
  category: { type: String }, 
  image: { type: String }, 
  contributors: [String],
  timestamp: { type: Date, default: Date.now },
  sections: [SectionSchema], 
});

module.exports = mongoose.model("Article", ArticleSchema);
