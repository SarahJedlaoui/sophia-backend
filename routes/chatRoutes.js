const express = require('express');
const router = express.Router();
const axios = require("axios");
const dotenv = require('dotenv');
const Article = require("../models/Article"); 
const { respondToRelationshipQuestion,respondToAskAi, respondToComedyQuestion, improvGame, Contributions } = require('../controllers/chatController');

router.post('/respond-to-chat', respondToRelationshipQuestion);
router.post('/ask-ai', respondToAskAi);
router.post('/ask-saif', respondToComedyQuestion);
/** AI Chat Handler **/
router.post("/ask-ai2", async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required." });
    }

    const instructions = `
        You are a knowledgeable AI assistant that provides helpful responses based on the user's question. 
        Ensure your response is structured as follows:
        {
          "answer": "AI's conversational response to the user's question."
        }
    `;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant." },
                    { role: "user", content: `${instructions}\n\nUser Input: ${question}` }
                ],
                max_tokens: 500,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const rawText = response.data.choices[0]?.message?.content;
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

        // Send the formatted response
        res.json({ answer: cleanedText });

    } catch (error) {
        console.error("Error processing AI request:", error.message);
        res.status(500).json({ error: "Failed to generate response." });
    }
});
router.post('/improv-game', improvGame);
router.post('/add-contribution', Contributions);

// Route to create a new article
router.post("/articles", async (req, res) => {
    try {
        const { title, author, contributors, sections } = req.body;

        // Validate required fields
        if (!title || !author || !sections) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Check if the article already exists
        let existingArticle = await Article.findOne({ title });

        if (existingArticle) {
            return res.status(400).json({ error: "Article with this title already exists." });
        }

        // Create new article
        const newArticle = new Article({
            title,
            author,
            contributors,
            sections: sections.map(section => ({
                sectionTitle: section.title,
                content: section.content,
                originalContent: section.content,
                modifications: [] // Empty contributions initially
            }))
        });

        // Save the article
        await newArticle.save();

        res.status(201).json({ message: "Article created successfully!", article: newArticle });

    } catch (error) {
        console.error("❌ Error saving article:", error);
        res.status(500).json({ error: "Failed to save the article." });
    }
});

// Fetch all articles
router.get("/articles", async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles." });
    }
});

// Fetch a specific article by ID
//router.get("/articles/:id", async (req, res) => {
 //   try {
 //       const article = await Article.findById(req.params.id);
 //       if (!article) {
 //           return res.status(404).json({ error: "Article not found." });
 //       }
 //       res.json(article);
 //   } catch (error) {
 //       res.status(500).json({ error: "Failed to fetch article." });
 //   }
//});

// Route to get an article by title
router.get("/articles/:title", async (req, res) => {
    try {
        const { title } = req.params;

        // Find the article by title (case-insensitive search)
        const article = await Article.findOne({ title: { $regex: new RegExp(title, "i") } });

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json(article);
    } catch (error) {
        console.error("❌ Error fetching article:", error);
        res.status(500).json({ error: "Failed to fetch the article" });
    }
});


module.exports = router;
