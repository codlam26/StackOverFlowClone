// Answer Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AnswerSchema = new Schema({
    text: {type: String, required:[true, "Please Enter a Text"]},
    ans_by: {type: Schema.Types.ObjectId, ref: 'User'},
    ans_date_time: {type: Date, default: Date.now()},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
    votes:{ type: Number, default: 0 }
})

AnswerSchema.virtual('url').get(function(){
    return 'posts/answer/_id' + this.id;
})


module.exports = mongoose.model('Answers', AnswerSchema);