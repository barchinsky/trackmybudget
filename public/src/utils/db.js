var Budget = require('../models/budget');
var Transaction = require('../models/transaction');

 function getBudgetSpentAmount(userId, budgetId) {
  return new Promise( (resolve, reject) => {
    Budget.findOne({
      userId:userId,
      _id:budgetId
    }, (err, budget) => {
      if (err) {
        reject(err);
      }
      const {startDate, endDate} = budget;
      //console.log('Looking for transactions between:',startDate, endDate);
      // find transactions made between budget start and end dates
      Transaction.find({
        date : { $gte: startDate, $lt: endDate}
      }, (err, transactions) => {
        if (err) {
          reject(err);
        }

        //console.log('transactions.length:', transactions.length)
        if( !transactions.length ) resolve(0);
        else {
          // find sum of all transactionSchema
          let amountSpent = transactions.reduce((acc, transaction) => {
            return acc.amount + transaction.amount;
          });

          // console.log("Spent for current budget:", amountSpent);
          // const respData = {transactions:transactions, spent: amountSpent}
          resolve(amountSpent);
        }
      });

    });
  });
}

function getBudgets(userId) {
  return new Promise( (resolve, reject) => {
    Budget.find({userId: userId}).lean().exec( (err, budgets) => {
      if(err) {
        reject(err);
      }
      //console.log("db.budgets", budgets);
      resolve(budgets);
    })

  });
}

async function getBudgetsWithAmount(userId) {
  const budgets = await getBudgets(userId);
  //console.log('getBudgetsWithAmount:', budgets);

  const budgetsWithAmount = [];

  for (budget of budgets) {
    //console.log(budget._id);
    const amount = await getBudgetSpentAmount(userId, budget._id);
    //console.log('amount:',amount);
    const updatedBudget = Object.assign({}, budget, {spentAmount: amount});
    budgetsWithAmount.push(updatedBudget);
  }

  return budgetsWithAmount;
}

module.exports = {
  getBudgetSpentAmount: getBudgetSpentAmount,
  getBudgets: getBudgets,
  getBudgetsWithAmount: getBudgetsWithAmount,
  development: {
  }
}
