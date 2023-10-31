// Answer Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AnswerSchema = new Schema({
    text: {type: String, required:[true, "Please Enter a Text"]},
    ans_by: {type: String, required:true},
    ans_date: {type: Date}
})

AnswerSchema.virtual('url').get(function(){
    return 'posts/answer/' + this.id;
})


module.exports = mongoose.model('Answers', AnswerSchema);