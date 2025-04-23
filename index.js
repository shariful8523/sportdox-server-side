const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

//  Middleware
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:5001'
  ],
}));
app.use(express.json());

//  MongoDB URI (replace with your actual env or hardcoded values for test)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wfpeu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

//  MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//  Main Async Function
async function run() {
  try {
    await client.connect();

    const database = client.db("productsDB");
    const productCollection = database.collection("products");

    //  Get all products
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get a product id

    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const product = await productCollection.findOne(query);
      res.send(product);
    })

    // product delete

    app.delete('/products/:id', async(req, res)=>{
      const id = req.params.id;
      console.log('please delete this product ', id);
      const query = {_id: new ObjectId(id)}

      const result = await productCollection.deleteOne(query);
      res.send(result)
    })

    // Post a new product
    app.post('/products', async (req, res) => {
      const product = req.body;
      console.log('New Product Received:', product);
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

   

    await client.db("admin").command({ ping: 1 });
    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
  }
}
run().catch(console.dir);

//  Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

//  Start Server
app.listen(port, () => {
  console.log(` Server is running on port: ${port}`);
});
