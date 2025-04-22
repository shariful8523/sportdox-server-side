const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wfpeu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("productsDB");
    const productCollection = database.collection("products");
    

    app.get('/products', async(req, res)=>{
        const cursor = productCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post('/products', async(req, res) => {
        const product = req.body;
        console.log('new product ', product)
        const result = await productCollection.insertOne(product);
        res.send(result);

    })













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, ()=> {
    console.log(`server is running on port : ${port}`)
})