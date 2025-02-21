const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();

// Replace with your actual website URL
const allowedOrigins = ["https://sophiaai.vercel.app/", "http://localhost:3000"];

app.use(cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true 
}));

app.use(express.json());

app.use('/api', chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
