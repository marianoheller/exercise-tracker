var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var User = require("./user");

var exerciseSchema = new Schema({
    username: { type: String, required: true},
    description: { type: String, required: true},
    duration: { type: Number, required: true},
    date: { type: Date, required: true}
});

//VALIDATORS PARA FECHA, ETC

var Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;