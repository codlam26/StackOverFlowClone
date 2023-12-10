// Question Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    text:{type: String, maxLength: 100, required:true},
    created_by:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    created_date:{type:Date, default: Date.now()},
    votes: {type:Number, default: 0}
})

CommentSchema.virtual('url').get(function(){
    return 'post/comment/_id' + this.id;
})

module.exports = mongoose.model('Comments', CommentSchema);