// Question Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var QuestionsSchema = new Schema({
    title:{type: String, required:true},
    text: {type:String, requried:true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags', required: true}],
    asked_by:{type:String},
    answers: [{type: Schema.Types.ObjectId, ref: 'Answers', required: true}],
    ans_date_time: {type: Date},
    views: {type:Number}
})

QuestionsSchema.virtual('url').get(function(){
    return 'post/questions/' + this.id;
})

module.exports = mongoose.model('Questions', QuestionsSchema);