const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const MODEL_STORAGE_PATH = path.join(__dirname, 'model.json'); // JSON file for model storage

// Define categories
const categories = ["Food & Dining", "Healthcare", "Travel", "Education", "Shopping", "Entertainment"];

// Tokenization Function (Ensures no undefined values)
const maxLength = 15;
function tokenize(text) {
    if (!text || typeof text !== "string") {
        console.error("⚠️ Invalid input to tokenize:", text);
        return new Array(maxLength).fill(0);  // Return a zero-filled array instead of crashing
    }
    
    const tokenized = text.toLowerCase().split("").map(c => c.charCodeAt(0));
    return tokenized.length > maxLength
        ? tokenized.slice(0, maxLength) // Truncate
        : [...tokenized, ...new Array(maxLength - tokenized.length).fill(0)]; // Pad
}

// Load Data from CSV
async function loadData() {
    console.log("📂 Loading dataset...");
    const filePath = path.join(__dirname, "expense_dataset.csv");
    const fileContent = fs.readFileSync(filePath, "utf8");
    
    const { data } = Papa.parse(fileContent, { header: true });
    console.log("✅ Dataset Loaded. Sample Data:", data.slice(0, 3));

    return data.filter(row => row.Description); // Remove entries with missing descriptions
}

// Check if model exists
async function loadModel() {
    if (fs.existsSync(MODEL_STORAGE_PATH)) {
        console.log("🔄 Loading pre-trained model...");
        const modelData = JSON.parse(fs.readFileSync(MODEL_STORAGE_PATH, "utf8"));
        model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [maxLength], units: 10, activation: 'relu' }));
        model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));
        model.setWeights(modelData.weights.map(w => tf.tensor(w.data, w.shape)));
        console.log("✅ Model loaded successfully.");
        return true;
    }
    return false;
}

// Training Function (Runs Only Once)
let model;
async function trainModel() {
    if (await loadModel()) return; // Load saved model if available

    console.log("🚀 Training new model...");
    const data = await loadData();

    // Convert text descriptions to tokenized data
    const trainX = data.map(row => tokenize(row.Description));
    const labels = data.map(row => categories.indexOf(row.Category));
    const trainY = tf.tensor2d(labels, [labels.length, 1]);

    // Define Neural Network Model
    model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [maxLength], units: 10, activation: 'relu' }));
    model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));
    model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: ['accuracy'] });

    // Train Model
    await model.fit(tf.tensor2d(trainX, [trainX.length, maxLength]), trainY, { epochs: 100 });
    console.log("✅ Model trained successfully!");

    // Save Model Weights in JSON Format
    const weights = model.getWeights().map(w => ({
        shape: w.shape,
        data: Array.from(w.dataSync())
    }));
    fs.writeFileSync(MODEL_STORAGE_PATH, JSON.stringify({ weights }));
    console.log("💾 Model weights saved.");
}

// Classify New Expense
async function classifyExpense(expenseName) {
    if (!model) {
        console.log("⚠️ Model not loaded! Loading now...");
        await trainModel();
    }

    const input = tokenize(expenseName);
    const tensorInput = tf.tensor2d([input], [1, maxLength]);
    const prediction = model.predict(tensorInput);
    const categoryIndex = prediction.argMax(1).dataSync()[0];

    return categories[categoryIndex];
}

// Train Model When Script Runs
trainModel();

module.exports = classifyExpense;
