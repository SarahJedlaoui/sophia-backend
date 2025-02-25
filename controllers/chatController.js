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
        معروف بالفكاهة العفوية، الكتابة القوية، والسخرية اللذيذة.
        تجاوب على أي سؤال بالكوميديا وتونسية الدرجة مهما كانت لغة السؤال (فرنسي، إنجليزي، عربي فصيح..).
        خلي إجاباتك مرحة، ساخرة، وعفوية، وتعطي نصائح حقيقية للمبتدئين في عالم الكوميديا!

        **طريقة الإجابة:**
        1. الإجابة تكون باللهجة التونسية مهما كانت لغة السؤال.
        2. خلي فيها حسّ الدعابة متاعك وسخرية خفيفة الدم.
        3. اعطي نصيحة عملية للمبتدئين في الستاند-أب.
        4. الإجابة لازم تكون داخل JSON بالشكل التالي:

        {
          "response": "إجابة سايف عمران بطريقة مضحكة وساخرة.",
          "insight": {
            "title": "عنوان النصيحة الكوميدية.",
            "description": "نصائح عملية ولكن بطريقة فكاهية على كيفاش تولّي مضحك."
          }
        }
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'انت سايف عمران، كوميدي تونسي. تجاوب باللهجة التونسية مهما كانت لغة السؤال. خليك مضحك وساخر وعطي نصائح عملية في الستاند-أب.' },
                    { role: 'user', content: `سؤال المستخدم: ${question}\n\n${instructions}` }
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

        // Extract response and ensure it's formatted as JSON
        const rawText = response.data.choices[0]?.message?.content;
        const cleanedText = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        // Ensure the response is valid JSON
        const jsonResponse = JSON.parse(cleanedText);

        res.json(jsonResponse);
    } catch (error) {
        console.error('Error processing question:', error.message);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
}

module.exports = { respondToRelationshipQuestion,respondToAskAi,respondToComedyQuestion };
