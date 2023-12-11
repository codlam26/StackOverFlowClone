// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 8000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods:['POST', 'PUT', 'GET', 'DELETE', 'PATCH'],
  credentials:true
}));

app.use(express.json());

let secretKey = process.argv.slice(2)[0];

app.use(
  session({
    secret: secretKey,
    cookie: {httpOnly: true, maxAge: 1000 * 60 * 5 * 60},
    resave: false,
    saveUninitialized: false,
  })
)

app.use(cookieParser());

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
const User = require('./models/users');
const Comments = require('./models/comments');

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

app.get('/tags/byUser/:userId', async (req,res) => {
  const userId = req.params.userId;
  try{
    const result = await Tags.find({created_by: userId}).exec();
    res.send(result);
  }
  catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

app.put('/tags/editTag/:tagId', async (req, res) => {
  const tag_id = req.params.tagId;
  let tag_name = req.body.name;
  let userId = req.body.userId

  try {
    const user = await User.findById(userId).exec();
    console.log(user.isAdmin);
    if (!user) {
      return res.status(404).send('User not found');
    }
    tag_name = tag_name.toLowerCase();
    if (tag_name.length > 10 || tag_name.length < 1) {
      res.send('Error tag cannot be more than 10 characters or less than 1 character');
      return;
  }
    const tagObj = await Tags.find({ _id: tag_id }).exec();
    if (tagObj[0].created_by.toString() !== userId && !user.isAdmin) {
      res.send('Error you are not the owner of this tag');
      return;
    }
  
    const questionUsingTag = await Question.find({ tags: tag_id }).exec();
    for (let i = 0; i < questionUsingTag.length; i++) {
      if (questionUsingTag[i].asked_by.toString() !== tagObj[0].created_by.toString()) {
        res.send('Error another user is using this tag');
        return;
      }
    }

    const result = await Tags.updateOne({ _id: tag_id }, { $set: { name: tag_name } }).exec();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})

app.delete('/tags/deleteTag/:tagId', async (req, res) => {
  
  try {
    const tagId = req.params.tagId;
    const userId = req.query.userId; 
    // const user = await User.findById(userId).exec();
    const Tag = await Tags.findById(tagId).exec();
    if (!Tag) {
      return res.status(404).send('Tag not found');
    }
    console.log(userId);
    if (Tag.created_by.toString() !== userId.toString()) {
      res.status(403).send('Error: Unauthorized to delete the tag');
      return;
    }

    const questionUsingTag = await Question.find({ tags: tagId }).exec();
    for (let i = 0; i < questionUsingTag.length; i++) {
      if (questionUsingTag[i].asked_by.toString() !== Tag.created_by.toString()) {
        res.send('Error: Another user is using this tag');
        return;
      }
    }

    await Tags.deleteOne({ _id: tagId }).exec();
    await Question.updateMany({ tags: tagId }, { $pull: { tags: tagId } }).exec();
    res.json({ success: true, message: 'Tag deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
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

app.patch('/answers/incrementvotes/:answer_id' , async (req, res) => {
  try{
    const answer = await Answers.findById(req.params.answer_id);
    const {userId, voteType} = req.body;
    const user = await User.findById(userId);
    if(!user || user.reputation < 50){
      return res.status(403).send('User cannot vote, low reputation')
    }
    if(!answer){
        return res.status(404).send('Answer not found');
    }

    const voteIncrement = voteType === 'upvote' ? 1: -1;
    const changeReputation = voteType === 'upvote' ? 5 : -10;

    answer.votes += voteIncrement;
    await answer.save();

    const answerAuthor = await User.findById(answer.ans_by);
    answerAuthor.reputation += changeReputation;
    await answerAuthor.save();

    res.send({success:true, answer, answerAuthor});
  }
  catch(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

})

app.delete('/answers/deleteAnswer/:answerId',  async (req, res) =>{
  try{
    const answer = await Answers.findById(req.params.answerId).exec();
    if(answer){
      const question = await Question.find({answers: { $in: answer}}).exec();
      if(question){
        question[0].answers.pull(answer._id);
        await question[0].save();
      }

      answer.comments.forEach(async (comment) => {
        await Comments.deleteOne({_id: comment._id}).exec()
      })

      await Answers.deleteOne({_id: req.params.answerId}).exec()
      res.send('success');
    }
    else{
      res.status(404).send('Answer not found');
    }
  }
  catch (error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

app.put('/answers/editAnswer/:answerId',  async (req, res) => {
  const {answerText, username} = req.body;
    const {answerId} = req.params;
    if(!answerText || !username){
      return res.status(400).json({error: "All fields are required"})
    }
    try{
      const updatedAnswer = await Answers.findByIdAndUpdate(
        answerId,
        {text:answerText,
        ans_by: username,
        ans_date_time: new Date(),
      },
        {new: true}
      )
      if(updatedAnswer){
        res.status(200).json({message: 'answer updated successfully'});
      }
      else{
        res.status(400).json({error: 'Valdiation failed'})
      }
    }
    catch(err){
      console.error('Error updating answer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

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

  app.patch('/questions/incrementvotes/:question_id', async (req, res) => {
    try{
      const question = await Question.findById(req.params.question_id);
      const {userId, voteType} = req.body;
      const user = await User.findById(userId);
      if(!user || user.reputation < 50){
        return res.status(403).send('User cannot vote, low reputation')
      }
      if(!question){
          return res.status(404).send('Question not found');
      }

      const voteIncrement = voteType === 'upvote' ? 1: -1;
      const changeReputation = voteType === 'upvote' ? 5 : -10;

      question.votes += voteIncrement;
      await question.save();

      const questionAuthor = await User.findById(question.asked_by);
      questionAuthor.reputation += changeReputation;
      await questionAuthor.save();

      res.send({success:true, question, questionAuthor});
    }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
    
  })

  app.get('/questions/byUser/:userId',async (req, res) => {
    try{
      const questions = await Question.find({asked_by: req.params.userId}).sort
      ({ask_date_time: -1}).exec();
      res.send(questions)
    }
    catch(err){
      console.error(err)
      res.status(500).send('Internal Server Error');
    }
  })

  async function getNewTag(input_tag, username){
    var tagIdArray = [];
    var tagArray = input_tag.toLowerCase().split(" ");
    var existingTagSet = new Set();
    
    for(var i = 0, len = tagArray.length; i < len; i++){
      const tagName = tagArray[i].toLowerCase()
      var existingTag = await Tags.findOne({name:tagArray[i]}).exec();
      if(existingTag){
        existingTagSet.add(existingTag._id);
      }
      else{
          const newTag = new Tags({
            name: tagName,
            created_by: username
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

  async function addNewQuestion(title, summary, text, tags, username){
    var tagArray = tags.split(" ");
    for(var i = 0, len = tagArray.length; i < len; i++){
      if(tagArray[i].length > 10 || tagArray.length > 5 ){
        return false;
      }
    }
      const newQuestion = {
      title: title,
      summary: summary,
      text: text,
      tags: await getNewTag(tags, username),
      asked_by: username,
    }
    const questionInstance = new Question(newQuestion);
    await questionInstance.save();
    return true;
   }

   app.post('/api/questions/askQuestion', async (req, res) => {
    const {title, summary, text, tags, username } = req.body;
    if (!title || !summary|| !text || !tags || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if(username.reputation < 50){
      res.send({ error: true, message: 'User must have at least 50 reputation points to create a new tag.' });
      return;
    }
    try {
      const result = await addNewQuestion(title, summary, text, tags, username);
  
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

  app.get('/question/questionAnswered/:userId', async (req, res) => {
    try{
      const answersByUser = await Answers.find({ans_by: req.params.userId}).exec();
      const questions = await Question.find({answers: {$in: answersByUser}}).sort({ask_date_time: -1});
      res.send(questions);
    }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  })
  
  async function updateQuestion(id, title, summary, text, tags, username) {
    const tagArray = tags.split(" ");
    for (let tag of tagArray) {
        if (tag.length > 10 || tagArray.length > 5) {
            return false;
        }
    }
    const updatedQuestion = {
        title: title,
        summary: summary,
        text: text,
        tags: await getNewTag(tags),
        asked_by: username,
        ask_date_time: new Date()
    };

    try {
        const updated  = await Question.findByIdAndUpdate(id, updatedQuestion, { new: true });
        return updated;
    } catch (error) {
        console.error('Error updating question:', error);
        return false;
    }
}

  app.put('/editQuestion/:questionId', async (req, res) => {
    const {title, summary, text, tags, username} = req.body;
    const {questionId} = req.params;
    if(!title || !summary || !text || !tags || !username){
      return res.status(400).json({error: "All fields are required"})
    }
    try{
      const result = await updateQuestion(questionId, title, summary, text, tags, username);
      if(result){
        res.status(200).json({message: 'Question updated successfully'});
      }
      else{
        res.status(400).json({error: 'Valdiation failed'})
      }
    }
    catch(err){
      console.error('Error updating question:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  })

  app.delete('/deleteQuestion/:questionId', async (req, res) => {
    try{
      const question =  await Question.findById(req.params.questionId).exec();
      console.log(question);
    if(!question){
      res.status(404).send('Question not found');
      return;
    }
    question.answers.forEach(async (answer) => {
      await Answers.findByIdAndDelete(answer).exec();
    })

    question.comments.forEach(async (comment) => {
      await Comments.findByIdAndDelete(comment).exec();
    })

    await Question.findByIdAndDelete(req.params.questionId).exec();
    res.send('success');
    }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
    
  })

  //Comments
  app.get('/question/:question_id/comments', async (req, res) => {
    try{
      const question = await Question.findById(req.params.question_id).exec();
      const comments = await Comments.find({_id: {$in: question.comments}}).exec();
      res.send(comments);
  }
  catch(err){
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
  })

  app.get('/answer/:answer_id/comments', async (req, res) => {
    try{
      const answer = await Answers.findById(req.params.answer_id).exec();
      const comments = await Comments.find({_id: {$in: answer.comments}}).exec();
      res.send(comments);
  }
  catch(err){
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
  })

  app.post('/postComments', async (req, res) => {
    try{
      const {text, userId, id, commentType} = req.body;
      // let newCommentInput = req.body;
      // newCommentInput.created_by = req.session.user.user_id;
      const user = await User.findById(userId).exec();
      if(user.reputation < 50){
        res.send('User reputation is too low');
        return; 
      }
      if(text.length === 0  || text.length > 140){
        res.send("Comment must be between 1 and 140 characters");
        return;
      }
      const newComment = new Comments({
          text: text,
          created_by: user,
      })
      await newComment.save();

      if(commentType === 'answer'){
        const answer = await Answers.findById(id).exec();
        await addCommentToAnswers(answer, newComment)
      }
      if(commentType === 'question'){
        const question = await Question.findById(id).exec();
        await addCommentToQuestions(question, newComment)
      }
    }
    catch(error){
      console.error("Comment cannot be posted:", error)
    }
  })

  async function addCommentToAnswers(answer, comment){
    answer.comments.push(comment);
    await answer.save();
  }
  async function addCommentToQuestions(question, comment){
    question.comments.push(comment);
    await question.save();
  }

  app.patch('/comments/incrementvotes/:comment_id', async (req, res) => {
    try{
      const comment = await Comments.findById(req.params.comment_id);
      const {userId, voteType} = req.body;
      const user = await User.findById(userId);
      console.log(user);
      if(!user){
        return res.status(403).send('User not Found')
      }
      if(!comment){
          return res.status(404).send('Comment not found');
      }

      const voteIncrement = voteType === 'upvote' ? 1: -1;
      const changeReputation = voteType === 'upvote' ? 5 : -10;

      comment.votes += voteIncrement;
      await comment.save();

      const commentAuthor = await User.findById(comment.created_by);
      commentAuthor.reputation += changeReputation;
      await commentAuthor.save();

      res.send({success:true, comment, commentAuthor});
    }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
    
  })

  //Users
  app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email }).exec();
      const existingUser_username = await User.findOne({ username }).exec();
      if (existingUser_username) {
        return res.status(400).json({ success: false, message: 'Username is taken, try again' });
      }
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
      });
  
      await newUser.save();
      res.json({ success: true, message: 'Signup successful', user: newUser });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).exec();
      if(!user){
        res.status(403).json({ success: false, message: 'Invalid email' })
      }
      if (await bcrypt.compare(password, user.password)) {
        const sessionUser = {
          loggedIn: true,
          username: user.username,
          email: user.email,
          userId: user._id,
          reputation: user.reputation,
          created_date: user.created_date,
          isAdmin: user.isAdmin,
        };
        req.session.user = sessionUser;
        res.json({ success: true, message: 'Login successful', user});
        return;
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.get('/session', (req, res) => {
    res.send(req.session.user); 
  })

  app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      res.send(err);
      return;
    });
    res.send('success');
  })

  function isAutheticated(req, res, next){
    if(req.session.user){
      next();
    }
    else{
      res.status(401).send('Unauthorized')
    }
  }

  app.get('/api/users', async (req, res) => {
    try{
      const users = await User.find();
      res.json(users);
  }
  catch(error){
      console.error(error);
      res.status(500).json({error: 'Server error'});
  }
  })

  app.get('/users/:user_id/username',  async (req, res) => {
    try{
      const user = await User.findById(req.params.user_id).exec();
    res.send(user.username);
    }
    catch (err) {
      res.send('Internal Server Error'); 
    }
  });

  app.delete('/users/deleteUser/:id', async (req, res) => {
    // if(!req.session.user.isAdmin){
    //   res.send('You do not have permission to delete users.')
    // }

    try{
      const questions = await Question.find({asked_by: req.params.id}).exec();
      questions.forEach(async (question) => {
        question.answers.forEach(async (answer) => {
          await Answers.findByIdAndDelete(answer).exec();
        });
        question.comments.forEach(async (comment) => {
          await Comments.findByIdAndDelete(comment).exec();
        });
      });

      await Question.deleteMany({asked_by: req.params.id}).exec();

      await Answers.deleteMany({ans_by: req.params.id}).exec();

      await Comments.deleteMany({created_by: req.params.id}).exec();

      const tags = await Tags.find({created_by: req.params.id}).exec();
      for (const tag of tags) {
        const questionTag = await Question.find({tags: tag._id.toString()}).exec();
        let deleteTag = true;
        for (const question of questionTag){
          if(question.asked_by.toString() !== tag.created_by.toString()){
            deleteTag = false;
            break;
          }
        }

        if(deleteTag){
          await Tags.deleteOne({_id: tag._id}).exec();
        } 
        else{
          await Tags.updateOne({_id: tag._id}, {$set: {created_by:req.session.user}})
        }
      }

      await User.findByIdAndDelete(req.params.id).exec();

      res.send('success');
    }
    catch(err){
      console.log(err);
      res.send('Internal Server Error occurred. Please try again');
      return;
    }
  })

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})