const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const apiRoutes = require('./src/routes/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully.');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });

app.get('/', (req, res) => {
    res.send('<h1>Product CRUD API is Running!</h1><p>Use /api/products for CRUD operations.</p>');
});

app.use('/api', apiRoutes);

app.use((req, res) => {
    res.status(404).send({ message: 'Route not found. Check your URL.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
