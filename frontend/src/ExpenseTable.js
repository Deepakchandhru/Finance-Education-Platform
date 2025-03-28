import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExpenseTable = ({ userId }) => {
    const [expenses, setExpenses] = useState([]);
    const [categorized, setCategorized] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/expenses/${userId}`)
            .then(res => setExpenses(res.data));

        axios.get(`http://localhost:5000/api/expenses/classify/${userId}`)
            .then(res => setCategorized(res.data.categorizedExpenses));
    }, [userId]);

    return (
        <div>
            <h2>Expenses</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {categorized ? categorized.map((exp, idx) => (
                        <tr key={idx}>
                            <td>{exp.expense_name}</td>
                            <td>${exp.amount}</td>
                            <td>{exp.category}</td>
                        </tr>
                    )) : expenses.map((exp, idx) => (
                        <tr key={idx}>
                            <td>{exp.expense_name}</td>
                            <td>${exp.amount}</td>
                            <td>Loading...</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseTable;
