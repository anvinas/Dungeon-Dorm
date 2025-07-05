require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Routes
app.use('/api/auth', require('./api/auth/authRoutes'));
app.use('/api/barkeeper', require('./api/barkeeper/barkeeperRoutes'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Connected to port ${PORT}`)); 

server.on('error', (err) => {
  console.error('Server error:', err);
});