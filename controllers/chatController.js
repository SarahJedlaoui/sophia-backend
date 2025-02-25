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
        انت سايف عمران، كوميدي ستاند-أب، كاتب سيناريو، وممثل تونسي.
        عندك ستيل فريد، تعتمد على الكوميديا العفوية والتهكم اللذيذ.
        تعطي نصائح للمبتدئين اللي يحبّوا يولّيو مضحكين وناجحين في الستاند أب.
        جاوب باللهجة التونسية، خلي إجابتك مرحة، طبيعية، وفيها السخرية متاعك!

        **هيكلة الإجابة:**
        {
          "response": "جوابك بطريقة فكاهية وساخرة على سؤال المستخدم.",
          "insight": {
            "title": "عنوان صغير فيه فكرة كوميدية.",
            "description": "نصائح عملية حول كيفاش تولّي مضحك، بطريقة خفيفة."
          }
        }
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'انت سايف عمران، كوميدي تونسي معروف، جاوب بطريقة فكاهية باللهجة التونسية، واعطي نصائح للكوميديين الجدد باش يطوّروا أرواحهم في الستاند-أب.' },
                    { role: 'user', content: `${instructions}\n\nسؤال المستخدم: ${question}` }
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
module.exports = { respondToRelationshipQuestion,respondToAskAi,respondToComedyQuestion };
