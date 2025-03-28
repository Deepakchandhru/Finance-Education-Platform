const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://DeepakChandhru:Deepak@clusterdeepak.c9zlk.mongodb.net/financial_edutech?retryWrites=true&w=majority&appName=ClusterDeepak";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
