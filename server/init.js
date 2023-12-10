//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc. 

const bcrypt = require('bcrypt');
let mongoose = require('mongoose');

let userArgs = process.argv.slice(2);

if(userArgs.length < 2){
    throw new Error('Must provide 2 Arguments: an email address and password for Admin');
}

let Question = require('./models/questions')
let Tag = require('./models/tags');
let Answer = require('./models/answers');
let User = require('./models/users');
let Comment = require('./models/comments');

let mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB connection error"));

function userCreate(username, email, password, isAdmin, created_date, reputation){
    let user = new User({
        username: username,
        email: email,
        password: password,
        isAdmin: isAdmin,
        created_date: created_date,
        reputation: reputation,
    });
    return user.save();
}

function tagCreate(name, user){
    let tag = new Tag({
        name: name,
        created_by: user,
    })
    return tag.save()
}

function questionCreate(title, summary, text, tags, answers, asked_by, ask_date_time, views, votes, comments){
    let question = new Question({
        title: title,
        summary: summary,
        text: text, 
        tags: tags,
        answers: answers,
        asked_by: asked_by,
        ask_date_time: ask_date_time,
        views: views,
        votes: votes,
        comments: comments,
    })
    return question.save();
}

function answerCreate(text, ans_by, ans_date_time, votes, comments){
    let answer = new Answer({
        text: text,
        ans_by: ans_by,
        ans_date_time: ans_date_time,
        votes: votes,
        comments: comments,
    })
    return answer.save();
}

function commentCreate(text, created_by, created_date ,votes){
    let comment = new Comment({
        text: text, 
        created_by: created_by,
        created_date: created_date,
        votes: votes,
    })
    return comment.save();
}

const dummyText = [
    "rifle",
    "tract",
    "state",
    "forecast",
    "ball",
    "rich",
    "prince",
    "back",
    "failure",
    "slap",
    "fight",
    "mood",
    "admire",
    "studio",
    "initiative",
    "payment",
    "year",
    "registration",
    "yearn",
    "permanent"
];

const randomIndex = (list) => Math.floor(Math.random() * list.length);
const random = (list2) => list2[randomIndex(list2)];

async function populate() {
    try{
        
            await db.dropDatabase();    
        const hashedPassword_admin = await bcrypt.hash(userArgs[1], 10);
        let admin_user = await userCreate('Admin', userArgs[0], hashedPassword_admin, true, new Date(), 1000);
        admin_user.save();

        const users = [];
        const reputations = [0, 40, 70];
        for(let i = 1; i <= 3; i++){
            const username = `user${i}`;
            const email = `user${i}@gmail.com`;
            const password = 'password123';
            const hashPassword = await bcrypt.hash(password, 10);
            const isAdmin = false;
            const created_by = new Date();
            const reputation = reputations[i - 1];
            let user = await userCreate(username, email, hashPassword, isAdmin, created_by, reputation);
            users.push(user)
        }

        const tags = [];
        for(let i = 0; i < 10; i++){
            let tag = await tagCreate(`tag${i}`, users[i % 3]);
            tags.push(tag);
        }

        const comments = [];
        for(let i = 0; i < 10; i++){
            const text = `Comment${i} ${random(dummyText)}`;
            const created_by = random(users);
            const created_date = new Date();
            const votes = 0;
            const comment = await commentCreate(text, created_by, created_date, votes)
            comments.push(comment);
        }

        const answers = [];
        for(let i = 0; i < 24; i++){
            const text = `Answer ${i}: ${random(dummyText)} ${random(dummyText)}`;
            const ans_by = random(users);
            const ans_date_time = new Date();
            const votes = 0;
            const answerComment = [random(comments), random(comments)];
            const answer = await answerCreate(text, ans_by, ans_date_time, votes, answerComment);
            answers.push(answer); 
        }

        function getRandomRange(min,max){
            let range = [];
            let randomStart = Math.floor(Math.random() * (max - min + 1)) + min;
            let randomEnd = Math.floor(Math.random() * (max - randomStart + 1)) + randomStart;
            range.push(randomStart);
            range.push(randomEnd);
            return range;
        }

        const questions = [];
        for(let i = 0; i <= 15; i++){
            const title = `Question Title #${i}: ${random(dummyText)}`;
            const summary = `This is the summary of question ${i}: ${random(dummyText)} ${random(dummyText)}`;
            const text = `Text of question ${i}: ${random(dummyText)} ${random(dummyText)} `
            const questionTags = [random(tags)];
            const questionAnswers = [];
            let [min, max] = getRandomRange(0 , answers.length);
            for(let j = min; j < max; j++){
                questionAnswers.push(answers[j]);
                }
            const asked_by = random(users);
            const ask_date_time = new Date();
            const views = i % 3;
            const votes = 0;
            const questionComments = [random(comments), random(comments), random(comments), random(comments) ];
            const question = await questionCreate(title, summary, text, questionTags, questionAnswers, asked_by, ask_date_time, views, votes, questionComments);
            questions.push(question); 
         }
        
        console.log('Database populated Successfully');
    }
    catch (err){
        console.error('Error populating database');
    }
    finally{
        db.close();
    }
}

populate();