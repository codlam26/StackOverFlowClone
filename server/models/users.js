
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: {type:Boolean, default:false},
    reputation: {type: Number, required: true, default: 0},
    created_date:{type: Date, default: Date.now()}
});

UserSchema.virtual('url').get(function(){
    return 'post/users/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);