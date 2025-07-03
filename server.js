require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'LargeProject' // ✅ Force Mongoose to use the correct DB name
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

mongoose.connection.once('open', () => {
  console.log("✅ Connected to MongoDB");
  console.log("📂 Using DB name:", mongoose.connection.name);
});

// Routes
app.use('/api/auth', require('./api/auth/authRoutes'));

// Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});
