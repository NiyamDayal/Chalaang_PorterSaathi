require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { getSystemPrompt } = require('./prompts/systemPrompt');

// Initialize Express and OpenAI
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors()); // Allows requests from your React frontend (localhost:3000)
app.use(express.json()); // Allows the server to parse JSON bodies

// Root endpoint to check if server is live
app.get('/', (req, res) => {
  res.json({ message: 'Porter Saathi Backend is running!' });
});

// The main API endpoint that the frontend calls
app.post('/ask-saathi', async (req, res) => {
  const userMessage = req.body.message;

  // Input validation
  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided in request body.' });
  }

  console.log(`User asked: "${userMessage}"`);

  try {
    // Create the chat completion using OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use "gpt-4" for better results if you have access
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: userMessage }
      ],
      max_tokens: 150, // Keeps responses short
      temperature: 0.7, // Balances creativity and factuality
    });

    const aiResponse = completion.choices[0].message.content;
    console.log(`Saathi replied: "${aiResponse}"`);

    // Send the AI's response back to the frontend
    res.json({ reply: aiResponse });

  } catch (error) {
    // Handle errors gracefully
    console.error('OpenAI API error:', error);

    let errorMessage = 'Sorry, Saathi is unable to respond at the moment.';
    let statusCode = 500;

    if (error.response) {
      // The request was made and the server responded with a status code out of the range of 2xx
      console.error('API Response Error:', error.response.status, error.response.data);
      errorMessage = 'An error occurred with the AI service.';
      statusCode = error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
      errorMessage = 'Cannot connect to the AI service. Please check your network.';
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Porter Saathi backend server running on http://localhost:${PORT}`);
});