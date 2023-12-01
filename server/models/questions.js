// Question Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionsSchema = new Schema({
    title:{type: String, maxLength: 100, required:true},
    text: {type:String, required:true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags', required: true}],
    asked_by:{type:String, default:"Anonymous"},
    answers: [{type: Schema.Types.ObjectId, ref: 'Answers'}],
    ask_date_time: {type: Date, default: Date.now},
    views: {type:Number, default: 0},
    votes: {
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
    },
})

QuestionsSchema.virtual('url').get(function(){
    return 'post/questions/_id' + this.id;
})

module.exports = mongoose.model('Questions', QuestionsSchema);