// Tag Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TagSchema = new Schema({
    name: {type: String, required:true}
})

TagSchema.virtual('url').get(function(){
    return 'posts/tags/_id' + this.id;
})

module.exports = mongoose.model('Tags', TagSchema);