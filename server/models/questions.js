// Question Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionsSchema = new Schema({
    title:{type: String, maxLength: 50, required:true},
    text: {type:String, required:true},
    summary: {type:String, required:true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags', required: true}],
    asked_by:{type:Schema.Types.ObjectId, ref: 'User'},
    answers: [{type: Schema.Types.ObjectId, ref: 'Answers'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
    ask_date_time: {type: Date, default: Date.now},
    views: {type:Number, default: 0},
    votes: {type: Number, default: 0 },
})

QuestionsSchema.virtual('url').get(function(){
    return 'post/questions/_id' + this.id;
})

module.exports = mongoose.model('Questions', QuestionsSchema);