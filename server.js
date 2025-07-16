require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

/*
const originalUse = app.use;
app.use = function (path, ...args) {
  if (typeof path === 'string' && /^https?:\/\//.test(path)) {
    console.error(`❌ Found full URL in app.use(): ${path}`);
    process.exit(1);
  }
  return originalUse.call(this, path, ...args);
};

const originalRouter = express.Router;
express.Router = function (...args) {
  const router = originalRouter.apply(this, args);

  ['use', 'get', 'post', 'put', 'delete', 'patch'].forEach(method => {
    const original = router[method];
    router[method] = function (path, ...handlers) {
      if (typeof path === 'string' && /^https?:\/\//.test(path)) {
        console.error(`❌ Found full URL in router.${method}(): ${path}`);
        process.exit(1);
      }
      return original.call(this, path, ...handlers);
    };
  });

  return router;
};

*/




app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

require('./api/auth/authModel');
require('./api/barkeeper/BarKeeper');
require('./api/barkeeper/InventoryItem');
require('./models/CharacterClass'); 
  
// Routes
//console.log('Loading authRoutes...');
app.use('/api/auth', require('./api/auth/authRoutes'));
//console.log('authRoutes loaded successfully');
app.use('/api/barkeeper', require('./api/barkeeper/barkeeperRoutes'));
app.use('/api/user', require('./api/user/userRoutes'));

const path = require('path');

//const staticPath = path.join(__dirname, 'frontend', 'dist');
//console.log('Static folder path:', staticPath);

/*
// Serve static files from the frontend
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
// Catch-all: Serve index.html for any unmatched route (frontend routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});
*/

// Serve React frontend (client/build must exist)
//app.use(express.static(path.join(__dirname, 'client', 'build')));

// Catch-all route for React Router
//app.get('*', (req, res) => {
//  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
//});


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Connected to port ${PORT}`)); 

server.on('error', (err) => {
  console.error('Server error:', err);
});