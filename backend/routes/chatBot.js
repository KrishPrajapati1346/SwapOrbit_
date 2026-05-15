const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files like HTML, CSS, JS

// AI Chatbot Route
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: message },
            {
                headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}` },
            }
        );

        const botResponse = response.data.generated_text || "I'm sorry, I couldn't understand that.";

        res.json({ message, botResponse });
    } catch (error) {
        console.error('Error communicating with AI:', error.message);
        res.status(500).json({ error: 'AI is currently unavailable. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
