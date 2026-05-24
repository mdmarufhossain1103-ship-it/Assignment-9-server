const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const db = client.db('ideavault');

        const userCollection = db.collection('idea');
        const ideasCollection = db.collection('ideas');
        const commentCollection = db.collection('comments');

        app.get('/users', async (req, res) => {
            try {
                const result = await userCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.get('/ideas', async(req,res) =>{
            try{
                const email = req.query.email;
                if (email){
                    const query = {email: email};
                    const result = await ideasCollection.find(query).toArray();
                    return res.send(result);
                }
            } catch(error){
                res.status(500).send({
                    error:error.message
                });
            }
        });


        app.get('/users/:id', async (req, res) => {
            try {

                const id = req.params.id;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({
                        error: 'Invalid ID'
                    });
                }

                const result = await userCollection.findOne({
                    _id: new ObjectId(id)
                });

                res.send(result);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.post('/ideas', async (req, res) => {
            try {

                const newUser = req.body;

                const result = await ideasCollection.insertOne(newUser);

                res.send(result);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.patch('/ideas/:id', async(req,res) =>{
            try{
                const id = req.params.id;
                const updatedIdea = req.body;

                if(!ObjectId.isValid(id)){
                    return res.status(400).send({
                        error: "Invalid ID"
                    });
                }

                const filter = {
                    _id: new ObjectId(id)
                };
                const updatedDoc = {
                    $set: updatedIdea
                };

                const result = await ideasCollection.updateOne(
                    filter,
                    updatedDoc
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });


        app.delete('/ideas/:id', async(req,res) =>{
            try {
                const id =req.params.id;

                if(!ObjectId.isValid(id)){
                    return res.status(400).send({
                        error: 'Invalid ID'
                    });
                }

                const result =await ideasCollection.deleteOne({
                    _id: new ObjectId(id)
                });

                res.send(result);
            } catch(error){
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.post('/users', async (req, res) => {
            try {

                const newUser = req.body;

                const result = await userCollection.insertOne(newUser);

                res.send(result);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.get('/comments/:ideaId', async (req, res) => {
            try {

                const ideaId = req.params.ideaId;

                const comments = await commentCollection
                    .find({ ideaId })
                    .sort({ createdAt: -1 })
                    .toArray();

                res.send(comments);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.post('/comments', async (req, res) => {
            try {

                const { ideaId, userName, text } = req.body;

                if (!ideaId || !userName || !text) {
                    return res.status(400).send({
                        error: 'Missing required fields'
                    });
                }

                const newComment = {
                    ideaId,
                    userName,
                    text,
                    createdAt: new Date(),
                    isEdited: false
                };

                const result = await commentCollection.insertOne(newComment);

                res.status(201).send({
                    _id: result.insertedId,
                    ...newComment
                });

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.patch('/comments/:id', async (req, res) => {
            try {

                const id = req.params.id;
                const { text } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({
                        error: 'Invalid ID'
                    });
                }

                const filter = {
                    _id: new ObjectId(id)
                };

                const updatedDoc = {
                    $set: {
                        text,
                        isEdited: true,
                        updatedAt: new Date()
                    }
                };

                const result = await commentCollection.updateOne(
                    filter,
                    updatedDoc
                );

                res.send(result);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        app.delete('/comments/:id', async (req, res) => {
            try {

                const id = req.params.id;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({
                        error: 'Invalid ID'
                    });
                }

                const result = await commentCollection.deleteOne({
                    _id: new ObjectId(id)
                });

                res.send(result);

            } catch (error) {
                res.status(500).send({
                    error: error.message
                });
            }
        });

        await client.db("admin").command({ ping: 1 });

        console.log("MongoDB Connected Successfully");

    } finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});