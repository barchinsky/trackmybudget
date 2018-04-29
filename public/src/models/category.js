var mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: String,
  color: String,
});

module.exports = mongoose.model('Category', categorySchema);