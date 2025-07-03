require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors({
  origin: 'https://dungeons-dorms.online',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

mongoose.connection.once('open', () => {
  console.log("✅ Connected to MongoDB");
  console.log("📂 Using DB name:", mongoose.connection.name);
});


app.use('/api/auth', require ('./api/auth/authRoutes'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Connected to port ${PORT}`)); 

server.on('error', (err) => {
  console.error('Server error:', err);
});