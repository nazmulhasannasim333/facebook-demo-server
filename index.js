const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.et32bhj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const postsCollection = client.db("facebookDB").collection("posts");

    // get data by user email, show in user profile, and all data show in home page
    app.get("/posts", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });

    // inser a data
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });

    // update a specific data
    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const post = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatePost = {
        $set: {
          details: post.details,
          image_url: post.image_url,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatePost,
        options
      );
      res.send(result);
    });

    // delete spesific a data
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Facebook server is running");
});

app.listen(port, () => {
  console.log(`Facebook server is running on port ${port}`);
});
