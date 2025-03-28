const tf = require('@tensorflow/tfjs');

// Training Data (Expense Names & Categories)
const data = [
    { name: "pizza", category: "food" },
    { name: "burger", category: "food" },
    { name: "school fees", category: "education" },
    { name: "bus ticket", category: "travel" },
    { name: "jeans", category: "clothes" },
    { name: "laptop", category: "electronics" }
];

// Convert categories into numeric labels
const categories = ["food", "education", "travel", "clothes", "electronics"];
const labels = data.map(item => categories.indexOf(item.category));

// Function to tokenize and pad/truncate text
const maxLength = 15;
const tokenize = text => {
    const tokenized = text.toLowerCase().split("").map(c => c.charCodeAt(0));
    return tokenized.length > maxLength
        ? tokenized.slice(0, maxLength) // Truncate
        : [...tokenized, ...new Array(maxLength - tokenized.length).fill(0)]; // Pad
};

// Prepare Training Data
const trainX = data.map(item => tokenize(item.name));
const trainY = tf.tensor2d(labels, [labels.length, 1]);

// Define Neural Network Model
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [maxLength], units: 10, activation: 'relu' }));
model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));
model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: ['accuracy'] });

// Train Model
async function trainModel() {
    await model.fit(tf.tensor2d(trainX, [trainX.length, maxLength]), trainY, { epochs: 100 });
    console.log("✅ Model trained successfully!");
}
trainModel();

// Function to classify new expenses
async function classifyExpense(expenseName) {
    const input = tokenize(expenseName);
    const tensorInput = tf.tensor2d([input], [1, maxLength]);
    const prediction = model.predict(tensorInput);
    const categoryIndex = prediction.argMax(1).dataSync()[0];
    return categories[categoryIndex];
}

module.exports = classifyExpense;
