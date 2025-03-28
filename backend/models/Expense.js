const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user_id: String,
    expense_name: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
