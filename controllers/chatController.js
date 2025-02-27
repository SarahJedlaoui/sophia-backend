const axios = require('axios');

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
        const { sectionTitle, originalContent, newContribution } = req.body;

        if (!sectionTitle || !originalContent || !newContribution) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Construct the prompt for OpenAI
        const prompt = `
        You are an AI editor responsible for refining content in a collaborative article. 
        The following is an original section and a new user contribution. Your job is to:
        - Verify the accuracy of the new contribution.
        - Remove any redundant or repeated content.
        - Integrate the new contribution into the original section naturally.
        - Maintain a clear and engaging writing style.

        **Original Section:**
        "${originalContent}"

        **New Contribution:**
        "${newContribution}"

        Provide the revised and merged final section as a single paragraph.
        `;

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

        const finalMergedContent = response.data.choices[0]?.message?.content.trim();

        res.json({ updatedSection: finalMergedContent });
    } catch (error) {
        console.error("Error processing contribution:", error.message);
        res.status(500).json({ error: "Failed to process the contribution." });
    }
};

module.exports = { respondToRelationshipQuestion,respondToAskAi,respondToComedyQuestion,improvGame, Contributions };
