const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { MongoClient } = require("mongodb");

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGO_URI);

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(); // Use default database from URI
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}


connectToMongo();

app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});


app.post('/api/signup', async (req, res, next) =>
{
  // incoming: firstName, lastNamem password
  var error = '';
  const { firstName, lastName,password } = req.body;
  
  var ret = { error: error, success:true};
  res.status(200).json({firstName,lastName,password,success:true});
});



app.listen(5000); 