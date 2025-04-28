const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:5001'
  ],
}));
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wfpeu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Main Async Function
async function run() {
  try {
    await client.connect();

    const database = client.db("productsDB");
    const productCollection = database.collection("products");
    const userCollection = database.collection("users");

    // ✅ Get products (filtered by userEmail if provided)
    app.get('/products', async (req, res) => {
      const { userEmail } = req.query;
      let query = {};

      if (userEmail) {
        query.userEmail = userEmail;
      }

      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // ✅ Get a single product by ID
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // ✅ Update a product
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          image: updatedProduct.image,
          itemName: updatedProduct.itemName,
          category: updatedProduct.category,
          price: updatedProduct.price,
          rating: updatedProduct.rating,
          stock: updatedProduct.stock,
          processingTime: updatedProduct.processingTime,
          customization: updatedProduct.customization,
          description: updatedProduct.description,
          userEmail: updatedProduct.userEmail,
          userName: updatedProduct.userName
        }
      };

      const result = await productCollection.updateOne(filter, updateDoc);
      res.send({
        success: true,
        modified: result.modifiedCount > 0
      });
    });

    // ✅ Delete a product
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // ✅ Add a new product
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // ✅ User APIs

    // Get all users
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Register a new user
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Connection test
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
  }
}
run().catch(console.dir);

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
