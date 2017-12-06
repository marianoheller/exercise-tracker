var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


var userSchema = new Schema({
    username: { type: String, required: true, unique: true }
});


var User = mongoose.model('User', userSchema);

module.exports = User;