// Tag Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TagSchema = new Schema({
    name: {type: String, required:true},
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

TagSchema.virtual('url').get(function(){
    return 'posts/tags/_id' + this.id;
})

module.exports = mongoose.model('Tags', TagSchema);