var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var exerciseSchema = new Schema({
    userId: String,
    description: String,
    duration: Number,
    date: Date,
});

//VALIDATORS PARA FECHA, ETC

var Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;