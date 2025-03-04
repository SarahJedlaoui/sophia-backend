const axios = require('axios');
const mongoose = require("mongoose");
const Article = require("../models/Article");
const { ObjectId } = mongoose.Types;

async function respondToRelationshipQuestion(req, res) {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    const instructions = `
        You are a relationship expert and therapist. Engage empathetically with the user, provide actionable advice, and suggest an insightful activity. 
        Ensure your response is structured as follows:
        {
          "response": "AI's conversational response to the user's question or feelings.",
          "insight": {
            "title": "Title of the advice or activity.",
            "description": "Detailed description of the advice or activity."
          }
        }
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a relationship expert offering empathetic guidance and actionable insights.' },
                    { role: 'user', content: `${instructions}\n\nUser Input: ${question}` }
                ],
                max_tokens: 1000,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const rawText = response.data.choices[0]?.message?.content;
        const cleanedText = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const jsonResponse = JSON.parse(cleanedText);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Error processing question:', error.message);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
}


async function respondToAskAi(req, res) {
    const { conversation, assistant } = req.body; // Get conversation and assistant

    if (!conversation || !Array.isArray(conversation) || !assistant) {
        return res.status(400).json({ error: "Invalid request format." });
    }

    const messages = conversation.map((chat) => ({
        role: chat.user ? "user" : "assistant",
        content: chat.text,
    }));

    // Define system message dynamically based on assistant
    let systemMessage = {
        role: "system",
        content: `
        You are ${assistant}, an Expert assistant who remembers conversations and provides relevant responses about everything you also could be asked about video to extract informations from it.
        Your response must be structured as:
        {
          "answer": "Your AI-generated response."
        }
        `,
    };

    messages.unshift(systemMessage);

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4-turbo",
                messages: messages,
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
        let cleanedText;
        try {
            cleanedText = JSON.parse(rawText);
        } catch (error) {
            cleanedText = { answer: rawText };
        }

        return res.json(cleanedText);
    } catch (error) {
        console.error("Error processing AI response:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to generate response." });
    }
}


async function respondToComedyQuestion(req, res) {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    const instructions = `
        You are Saif Omrane, a stand-up comedian, scriptwriter, and actor.
        You are known for your humor, storytelling, and sharp writing skills.
        Your goal is to give aspiring comedians advice on how to be funnier, improve their stand-up skills, and develop confidence on stage.
        Your responses should be insightful, but always include humor and a touch of sarcasm—just like Saif Omrane!

        Structure your response in this format:
        {
          "response": "Saif's funny and engaging response to the user's question.",
          "insight": {
            "title": "Short title of the comedic advice.",
            "description": "Practical tips with a touch of humor on how to be funnier."
          }
        }
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are Saif Omrane, a famous stand-up comedian and scriptwriter. Give comedy advice with humor, wit, and a Tunisian flair.' },
                    { role: 'user', content: `${instructions}\n\nUser Input: ${question}` }
                ],
                max_tokens: 1000,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const rawText = response.data.choices[0]?.message?.content;
        const cleanedText = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const jsonResponse = JSON.parse(cleanedText);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Error processing question:', error.message);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
}

const SCENARIOS = [
    "You're a detective solving a case with a talking cat as your partner.",
    "You're a pizza delivery guy from the future, but all pizzas are now in liquid form.",
    "You're an astronaut, but you just realized you're afraid of heights.",
    "You're a pirate who's afraid of water. What’s your solution?",
    "You're a superhero, but your only power is the ability to speak fluent dolphin."
];

async function improvGame(req, res) {
    const { userInput, scenarioIndex, hint } = req.body;

    // If no scenario is provided, start with a random one
    if (scenarioIndex === undefined) {
        const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        return res.json({
            aiResponse: `Yes, and… ${randomScenario}`,
            scenarioIndex: SCENARIOS.indexOf(randomScenario)
        });
    }

    // If user requests a hint, provide a suggestion
    if (hint) {
        return res.json({
            aiResponse: "Yes, and… you suddenly realize your socks have superpowers!"
        });
    }

    // Ensure user starts response with "Yes, and..."
    if (!userInput.startsWith("Yes, and")) {
        return res.json({
            aiResponse: "Oops! You need to start your response with 'Yes, and…' Try again!"
        });
    }

    try {
        const instructions = `
            You are playing the 'Yes, And…' improv game with the user.
            Your responses should always build on what the user says in a humorous and creative way.

            **Example:**
            AI: "You're a pirate who's afraid of water. What’s your solution?"
            User: "Yes, and I’ve decided my ship will only sail on land now!"
            AI: "Yes, and your crew is questioning why they have to row on a desert."

            Never end the story—always keep it going with a new humorous twist!
            Keep responses short (1-2 sentences) and witty.

            **User's Input:** "${userInput}"
            **Scenario:** "${SCENARIOS[scenarioIndex]}"
        `;

        const openAIResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: instructions },
                    { role: 'user', content: userInput }
                ],
                max_tokens: 100,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const aiResponse = openAIResponse.data.choices[0]?.message?.content.trim();
        res.json({ aiResponse });

    } catch (error) {
        console.error('Error processing improv game:', error.message);
        res.status(500).json({ error: 'Failed to generate AI response.' });
    }
}



async function Contributions(req, res) {
    try {
        console.log("🔹 Received request to /api/add-contribution");

        let { articleTitle, sectionTitle, originalContent, newContribution, contributor } = req.body;

        console.log("🔹 Incoming request data:", req.body);

        // Check for missing fields
        if (!articleTitle || !sectionTitle || !originalContent || !newContribution) {
            console.error("❌ Missing required fields:", {
                articleTitle: !!articleTitle,
                sectionTitle: !!sectionTitle,
                originalContent: !!originalContent,
                newContribution: !!newContribution,
            });
            return res.status(400).json({ error: "Missing required fields." });
        }

        console.log(`✅ Searching for article with title: "${articleTitle}"`);

        // Find article by title or create a new one
        let article = await Article.findOne({ title: articleTitle });

        if (!article) {
            console.log("❌ Article not found. Creating a new article...");
            article = new Article({
                title: articleTitle,
                author: "Unknown",
                contributors: [],
                sections: [],
            });

            await article.save();
            console.log("✅ New article created with title:", article.title);
        }

        console.log("✅ Article found or created. Searching for section...");

        // Find the section by title
        let sectionIndex = article.sections.findIndex((s) => s.sectionTitle === sectionTitle);

        if (sectionIndex === -1) {
            console.log("❌ Section not found. Creating a new section...");
            article.sections.push({
                sectionTitle: sectionTitle,
                originalContent: originalContent,
                modifications: [],
            });

            sectionIndex = article.sections.length - 1;
        }

        let section = article.sections[sectionIndex];

        console.log("✅ Section found or created. Updating content...");

        // Construct OpenAI prompt
        const prompt = `
        You are an AI editor responsible for refining content in a collaborative article. 
        The following is an original section and a new user contribution. Your job is to:
        - Verify the accuracy of the new contribution.
        - Remove any redundant or repeated content.
        - Integrate the new contribution into the original section naturally.
        - Maintain a clear and engaging writing style.

        **Original Section:**
        "${section.originalContent}"

        **New Contribution:**
        "${newContribution}"

        Provide the revised and merged final section as a single paragraph.
        `;

        console.log("🔹 Sending request to OpenAI API...");

        // Call OpenAI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "You are a skilled AI editor improving user-contributed content." },
                    { role: "user", content: prompt }
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

        console.log("✅ OpenAI API response received successfully.");

        const finalMergedContent = response.data.choices[0]?.message?.content.trim();
        console.log("🔹 Merged content from OpenAI:", finalMergedContent);

        // Add the new contribution to the history
        section.modifications.push({
            contributor: contributor || "Anonymous",
            addedText: newContribution,
            finalContent: finalMergedContent,
            timestamp: new Date(),
        });

        // Update the section content with the new AI-refined version
        section.originalContent = finalMergedContent;

        // ✅ Ensure contributor is added to the article's contributors list
        if (contributor && !article.contributors.includes(contributor)) {
            article.contributors.push(contributor);
        }

        console.log("🔹 Preparing to save updated article...");

        // Save the updated article
        await article.save();

        console.log("✅ Article updated and saved successfully.");
        res.json({ updatedSection: finalMergedContent, articleId: article._id });
    } catch (error) {
        console.error("❌ Error processing contribution:", error);
        res.status(500).json({ error: "Failed to process the contribution." });
    }
}




async function getSectionHistory(req, res) {
    try {
        const { articleId, sectionTitle } = req.query;

        if (!articleId || !sectionTitle) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: "Article not found." });
        }

        const section = article.sections.find((s) => s.sectionTitle === sectionTitle);
        if (!section) {
            return res.status(404).json({ error: "Section not found." });
        }

        res.json({ originalContent: section.originalContent, modifications: section.modifications });
    } catch (error) {
        console.error("Error fetching section history:", error);
        res.status(500).json({ error: "Failed to fetch history." });
    }
}

async function SummaryContributions(req, res) {
    try {
        console.log("🔹 Received request to /api/add-contribution");

        let { articleTitle, sectionTitle, newContribution, contributor } = req.body;

        console.log("🔹 Incoming request data:", req.body);

        // Check for missing fields
        if (!articleTitle || !sectionTitle || !newContribution) {
            console.error("❌ Missing required fields:", {
                articleTitle: !!articleTitle,
                sectionTitle: !!sectionTitle,
                newContribution: !!newContribution,
            });
            return res.status(400).json({ error: "Missing required fields." });
        }

        console.log(`✅ Searching for article with title: "${articleTitle}"`);

        // Find the article by title
        let article = await Article.findOne({ title: articleTitle });

        if (!article) {
            console.log("❌ Article not found. Creating a new article...");
            article = new Article({
                title: articleTitle,
                author: "Unknown",
                contributors: [],
                sections: [],
            });

            await article.save();
            console.log("✅ New article created with title:", article.title);
        }

        console.log("✅ Article found or created. Searching for section...");

        // Find the section by title
        let sectionIndex = article.sections.findIndex((s) => s.sectionTitle === sectionTitle);

        if (sectionIndex === -1) {
            console.log("❌ Section not found. Creating a new section...");
            article.sections.push({
                sectionTitle: sectionTitle,
                originalContent: "", // Initially empty, will be replaced by summarized contributions
                modifications: [],
            });

            sectionIndex = article.sections.length - 1;
        }

        let section = article.sections[sectionIndex];

        console.log("✅ Section found or created. Updating content...");

        // Add the new contribution to the history
        section.modifications.push({
            contributor: contributor || "Anonymous",
            addedText: newContribution,
            finalContent: newContribution, // Store the new contribution directly
            timestamp: new Date(),
        });

        // Collect all previous contributions (ignore original content)
        let allContributions = section.modifications.map(mod => mod.addedText).join("\n");

        // Construct OpenAI prompt for **progressive summarization**
        const prompt = `
        You are an AI summarization expert. Your job is to continuously expand an evolving summary of user contributions while avoiding repetition and preserving clarity.

        **Current Summary:**
        ${section.originalContent || "No summary yet."}

        **New Contribution:**
        ${newContribution}

        **Full Contribution History:**
        ${allContributions}

        Please merge the new contribution into the summary **without repeating existing points**. Ensure the summary remains structured, informative, and easy to read. The summary should continuously evolve as new contributions are added.
        `;

        console.log("🔹 Sending request to OpenAI API for progressive summarization...");

        // Call OpenAI API to generate the **expanded** summarized version
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "You are an expert summarizer who improves and expands content over time." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 800, // Allow enough space for expansion
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        console.log("✅ OpenAI API response received successfully.");

        const expandedSummary = response.data.choices[0]?.message?.content.trim();
        console.log("🔹 Expanded Summary:", expandedSummary);

        // Store the **growing summary** in `originalContent`
        section.originalContent = expandedSummary;

        // ✅ Ensure contributor is added to the article's contributors list
        if (contributor && !article.contributors.includes(contributor)) {
            article.contributors.push(contributor);
        }

        console.log("🔹 Preparing to save updated article...");

        // Save the updated article
        await article.save();

        console.log("✅ Article updated and saved successfully.");
        res.json({ updatedSection: expandedSummary, articleId: article._id });
    } catch (error) {
        console.error("❌ Error processing contribution:", error);
        res.status(500).json({ error: "Failed to process the contribution." });
    }
}





module.exports = { respondToRelationshipQuestion, respondToAskAi, respondToComedyQuestion, improvGame, Contributions, getSectionHistory,SummaryContributions };
