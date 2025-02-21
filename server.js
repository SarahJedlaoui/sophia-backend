const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
