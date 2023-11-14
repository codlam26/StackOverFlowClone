// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const dataURL = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(dataURL, {useNewUrlParser: true, useUnifiedTopology:true})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB' + error);
    });

process.on('SIGINT', async () => {
    try{
      await mongoose.connection.close(); 
      console.log('Server closed. Database instance disconnected');
      process.exit(0);
    }   
    catch(error){
      console.error('Error closing the database connection:', error);
      process.exit(1);
    }   
    
})

const Question = require('./models/questions');
const Tags = require('./models/tags');
const Answers = require('./models/answers');

//Tags
app.get('/api/tags', async(req,res) => {
  try{
      const tags = await Tags.find();
      res.json(tags);
  }
  catch(error){
      console.error(error);
      res.status(500).json({error: 'Server error'});
  }
});

app.get('/tag_id/:tag_id', async(req,res) => {
    const tag_id = req.params.tag_id;
    try{
        const result = await Tags.findById(tag_id).exec();
        res.send(result);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/tag_id/:tag_id/questions', async (req, res) => {
    const tag_id = req.params.tag_id;
    try{
        const result = await Question.find({tags: tag_id}).exec();
        res.send(result);
    }
    catch(err){
        console.err(err);
        res.status(500).send('Internal Server Error'); 
    }
});

app.get('/tags/:tags', async (req,res) => {
  try{
    const tagName = await Tags.findById(req.params.tags).exec();
    res.send(tagName);
  }
  catch(error){
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//answers
app.get('/api/answers', async (req,res) => {
  try{
    const answer = await Answers.find();
    res.send(answer);
  }
  catch(error){
    console.err(error);
    res.status(500).send("Internal Server Error")
  }
})

app.get('/api/answers/:question_id', async (req, res) => {
    try{
        const question = await Question.findById(req.params.question_id).exec();
        const answer = await Answers.find({_id: {$in: question.answers}}).exec();
        res.send(answer);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
})

app.post('/api/answers/answerQuestion', async (req,res) =>{
  const {username, answerText, qId} = req.body;
  try{
    const newAnswer = new Answers({
      text: answerText,
      ans_by: username,
    });

    const savedAnswer = await newAnswer.save();
    const updatedQuestion = await Question.findByIdAndUpdate(qId,
      {$push: {answers: savedAnswer._id} },
      {new: true}
    );
    if (updatedQuestion) {
      res.status(201).json({ message: 'Answer added successfully' });
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  }
  catch (error) {
    console.error('Error adding answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//questions
app.get('/api/questions/', async (req, res) => {
  try{
      const questions = await Question.find();
      res.json(questions);
  }
  catch(error){
      console.error(error);
      res.status(500).json({error: 'Server error'});
  }
});

app.get('/api/questions/:question_id', async (req,res) => {
    try{
        const question = await Question.findById(req.params.question_id).exec();
        res.send(question);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/questions/searched/:searchText', async(req, res) => {
  try{
    const search = req.params.searchText;
    const filteredQuestion = await filteredQuestions(search);
    res.send(filteredQuestion);
  }
  catch(error){
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

async function filteredQuestions(searchString){
  const searchTerm = searchString.toLowerCase();
  const filteredQuestions = [];
  const question = await Question.find().exec();
  const tagMatch = searchTerm.match(/^\[.*\]$/i);
  if(tagMatch){
    var k = 0;
    for(var i = 0, len = question.length; i < len; i++){ 
      for(var j = 0, len2 = question[i].tags.length; j < len2; j++){
        const tag = await Tags.findById(question[i].tags[j]);
      if((tagMatch[k]).search(tag.name) !== -1 && filteredQuestions[i] !== question[i]){
        filteredQuestions.push(question[i]);
      } 
    }
  }
}
  else{
    for(var i = 0, len = question.length; i < len; i++){  
      if(question[i].text.toLowerCase().search('\\b' + searchTerm + '\\b') !== -1 || (question[i].title.toLowerCase()).search('\\b' + searchTerm + '\\b') !== -1){
        filteredQuestions.push(question[i]);
      } 
  }
}
  return filteredQuestions;
 }

app.get('/questions/newest', async (req, res) => {
  try {
    const newestQuestions = await Question.find().sort({ ask_date_time: -1 }).exec();
    res.send(newestQuestions);
  } 
  catch (error) {
    console.err(error);
    res.status(500).send('Internal Server Error');
  }
});

async function getLastAnswerDate(questionId){
  try{
    const question = await Question.findById(questionId);
  if(!question){
    return 0;
  }
  let lastAnswerDate = 0;
  for(const answerId of question.answers){
    const answer = await Answers.findById(answerId).exec();
    if(answer){
      const answerDate = answer.ans_date_time;
      if(answerDate > lastAnswerDate){
        lastAnswerDate = answerDate;
      }
    }
  }
  
  return lastAnswerDate;
  }
  catch(error){
    console.error(error);
    return 0;
  }
}
app.get('/questions/active', async (req, res) => {
  try{
    const allQuestions = await Question.find();
    const sortedQuestionByAnswer = [];
    
    for(const question of allQuestions){
      const date = await getLastAnswerDate(question._id);
      sortedQuestionByAnswer.push({question,date});
    }
    sortedQuestionByAnswer.sort((a,b) =>
    {
      return b.date - a.date;
    });
    const sortedQuestion = sortedQuestionByAnswer.map(item => item.question);
    res.json(sortedQuestion);
  }
  catch(error){
    console.er(error);
    res.status(500).send("Internal Server Error");
  }
})

app.get('/questions/unanswered', async (req, res) => {
  try {
    const unansweredQuestions = await Question.find({answers:{$size:0}}).sort({ask_date_time: -1}).exec();
    res.send(unansweredQuestions);
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

async function incrementViews(questionId) {
    const updateResult = await Question.updateOne(
      { _id: questionId },
      { $inc: { views: 1 } } 
    );
    if (updateResult.matchedCount === 0) {
      return null; 
    } else {
      return Question.findOne({ _id: questionId }).exec();
    }
  }
  
  app.patch('/questions/incrementViews/:question', async (req, res) => {
    try {
      const updatedQuestion = await incrementViews(req.params.question);
      if (updatedQuestion) {
        res.send(updatedQuestion);
      } else {
        res.status(404).send('Question not found');
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  async function getNewTag(input_tag){
    var tagIdArray = [];
    var tagArray = input_tag.split(" ");
    var existingTagSet = new Set();
    
    for(var i = 0, len = tagArray.length; i < len; i++){
      const tagName = tagArray[i].toLowerCase()
      var existingTag = await Tags.findOne({name:tagArray[i]}).exec();
      if(existingTag){
        existingTagSet.add(existingTag._id);
      }
      else{
          const newTag = new Tags({
            name: tagName
          });
            await newTag.save();
            existingTagSet.add(newTag._id); 
          }
    }
    for(var j = 0, len2 = Array.from(existingTagSet).length; j < len2; j++){
      tagIdArray.push(Array.from(existingTagSet)[j]);
    }
    return tagIdArray;
  }

  async function addNewQuestion(title, text, tags, username){
    var tagArray = tags.split(" ");
    console.log("Recieved tagArray", tagArray);
    for(var i = 0, len = tagArray.length; i < len; i++){
      if(tagArray[i].length > 10 || tagArray.length > 5 ){
        return false;
      }
    }
      const newQuestion = {
      title: title,
      text: text,
      tags: await getNewTag(tags),
      asked_by: username,
    }
    const questionInstance = new Question(newQuestion);
    await questionInstance.save();
    return true;
   }

   app.post('/api/questions/askQuestion', async (req, res) => {
    const {title, text, tags, username } = req.body;
    if (!title || !text || !tags || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    try {
      const result = addNewQuestion(title, text, tags, username);
  
      if (result) {
        res.status(201).json({ message: 'Question added successfully' });
      } else {
        res.status(400).json({ error: 'Validation failed' });
      }
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})