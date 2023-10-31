// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const Question = require('./models/questions');

router.get('/api/questions/', async (req, res) => {
    try{
        const questions = await Question.find();
        res.json(questions);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
});

//module.exports = router;

//const questionsRoute = require('post/questions/');
//app.use('/', questionsRoute)

const dataURL = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(dataURL, {useNewURLParser: true, useUnifiedTopology:true})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB' + error);
    });

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Server closed. Database instance disconnected');
        process.exit(0);
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
