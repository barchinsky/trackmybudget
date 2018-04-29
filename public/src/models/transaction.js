var mongoose = require('mongoose');

var transactionSchema = mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: Date,
  amount: Number,
  category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'}
});

module.exports = mongoose.model('Category', transactionSchema);