require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
// For local development without a specific auth, usually mongodb://localhost:27017/gradescoped
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gradescoped';
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('GradeScoped API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
