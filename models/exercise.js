var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


var exerciseSchema = new Schema({
    username: { type: String},
    userId: { type: String, required: true},
    description: { type: String},
    duration: { type: Number},
    date: { type: Date}
});

//VALIDATORS PARA FECHA, ETC

var Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;