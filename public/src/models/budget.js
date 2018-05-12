var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var budgetSchema = Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  startDate: Date,
  endDate: Date,
  estimate: Number
});

module.exports = mongoose.model('Budget', budgetSchema);