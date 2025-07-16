require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const allowedOrigins = [
  'https://dungeons-dorms.online',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

require('./api/auth/authModel');
require('./api/barkeeper/BarKeeper');
require('./api/barkeeper/InventoryItem');
require('./api/models/CharacterClass'); 

// Routes
app.use('/api/auth', require('./api/auth/authRoutes'));
app.use('/api/barkeeper', require('./api/barkeeper/barkeeperRoutes'));
app.use('/api/user', require('./api/user/userRoutes'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Connected to port ${PORT}`)); 

server.on('error', (err) => {
  console.error('Server error:', err);
});
