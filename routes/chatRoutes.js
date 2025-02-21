const express = require('express');
const router = express.Router();
const axios = require("axios");
const dotenv = require('dotenv');

const { respondToRelationshipQuestion,respondToAskAi } = require('../controllers/chatController');

router.post('/respond-to-chat', respondToRelationshipQuestion);
router.post('/ask-ai', respondToAskAi);

/** AI Chat Handler **/
router.post("/ask-ai", async (req, res) => {
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
module.exports = router;
