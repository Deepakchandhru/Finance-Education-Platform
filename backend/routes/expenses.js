const express = require('express');
const Expense = require('../models/db/Expense');
const classifyExpense = require('../models/ml/ml_model');

const router = express.Router();

// Get expenses for a specific user
router.get('/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: req.params.user_id });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add an expense
router.post('/', async (req, res) => {
    try {
        const { user_id, expense_name, amount } = req.body;
        const expense = new Expense({ user_id, expense_name, amount });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Classify expenses
router.get('/classify/:user_id', async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: req.params.user_id });
        const categorizedExpenses = [];

        for (let expense of expenses) {
            const category = await classifyExpense(expense.expense_name);
            categorizedExpenses.push({ ...expense._doc, category });
        }

        res.json({ categorizedExpenses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
