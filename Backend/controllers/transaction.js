
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const Transaction = require('../models/transaction');
const axios = require('axios');





exports.validateTransactionData = async (req, res) => {
  const transactionData = req.body;
  
  try {
    // Check for duplicate transaction ID
    const existingTransaction = await Transaction.findOne({ transaction_id: transactionData.transaction_id });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "Duplicate transaction ID"
      });
    }

    // Initialize fraud detection variables
    let isFraudulent = false;
    let fraudReasons = [];
    let fraudScore = 0;
    let mlFraudScore = 0;

    // Call ML API for fraud prediction
    try {
      const mlResponse = await axios.post(process.env.ML_API_URL, {
        transaction_data: transactionData
      });

      mlFraudScore = mlResponse.data.fraud_score * 100; // Convert to percentage
      fraudScore += mlFraudScore;

      if (mlResponse.data.fraud_score > 0.7) { // If ML confidence > 70%
        isFraudulent = true;
        fraudReasons.push("ML model detected suspicious patterns");
      }
    } catch (mlError) {
      console.error("ML API Error:", mlError.message);
      // Proceed with rule-based checks if ML API fails
    }

    // Rule 1: Transaction velocity check
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentTransactions = await Transaction.countDocuments({
      payer_device: transactionData.payer_device,
      transaction_date: { $gte: oneMinuteAgo }
    });

    if (recentTransactions >= 5) {
      fraudScore += 30;
      fraudReasons.push("High transaction velocity (5+ in 1 minute)");
    }

    // Rule 2: Amount threshold check
    if (transactionData.transaction_amount > 100000) {
      fraudScore += 20;
      fraudReasons.push("High value transaction (>₹100,000)");
    }

    // Rule 3: Unusual payment rate
    const avgAmount = await Transaction.aggregate([
      { $match: { payer_email: transactionData.payer_email } },
      { $group: { _id: null, avg: { $avg: "$transaction_amount" } } }
    ]);

    if (avgAmount.length > 0 && 
        transactionData.transaction_amount > (avgAmount[0].avg * 5)) {
      fraudScore += 25;
      fraudReasons.push("Transaction amount 5x higher than user average");
    }

    // Determine final fraud status
    fraudScore = Math.min(fraudScore, 100);
    if (fraudScore >= 75) { // Threshold of 75% for fraud
      isFraudulent = true;
    }

    // Create transaction record
    const newTransaction = await Transaction.create({
      ...transactionData,
      is_fraudulent: isFraudulent,
      fraud_score: fraudScore,
      ml_fraud_score: mlFraudScore
    });
    newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction processed",
      data: {
        transaction_id: newTransaction.transaction_id,
        amount: newTransaction.transaction_amount,
        is_fraudulent: newTransaction.is_fraudulent,
        total_fraud_score: newTransaction.fraud_score,
        ml_fraud_score: newTransaction.ml_fraud_score,
        fraud_reasons: fraudReasons
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error("Transaction validation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// batch processing ********************************************
async function processTransaction(transaction) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check for duplicate transaction ID
      const existing = await Transaction.findOne({ transaction_id: transaction.transaction_id });
      if (existing) {
        return resolve({
          transaction_id: transaction.transaction_id,
          status: 'failed',
          error: 'Duplicate transaction ID'
        });
      }

      // Initialize fraud detection
      let isFraudulent = false;
      let fraudReasons = [];
      let fraudScore = 0;

      // Rule 1: Transaction velocity check (30 points)
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const transactionCount = await Transaction.countDocuments({
        payer_device: transaction.payer_device,
        transaction_date: { $gte: oneMinuteAgo }
      });

      if (transactionCount >= 5) {
        fraudScore += 30;
        fraudReasons.push('High transaction velocity (5+ in 1 minute)');
      }

      // Rule 2: Amount threshold check (20 points)
      if (transaction.transaction_amount > 100000) {
        fraudScore += 20;
        fraudReasons.push('High amount transaction (>₹100,000)');
      }

      // Rule 3: Unusual payment rate (25 points)
      const avgAmount = await Transaction.aggregate([
        { $match: { payer_email: transaction.payer_email } },
        { $group: { _id: null, avg: { $avg: "$transaction_amount" } } }
      ]);

      if (avgAmount.length > 0 && 
          transaction.transaction_amount > (avgAmount[0].avg * 5)) {
        fraudScore += 25;
        fraudReasons.push("Transaction amount 5x higher than user average");
      }

      // Determine final fraud status
      fraudScore = Math.min(fraudScore, 100);
      if (fraudScore >= 75) {
        isFraudulent = true;
      }

      // Create transaction record
      const newTransaction = await Transaction.create({
        ...transaction,
        is_fraudulent: isFraudulent,
        fraud_score: fraudScore
      });

      resolve({
        transaction_id: newTransaction.transaction_id,
        status: 'processed',
        is_fraudulent: newTransaction.is_fraudulent,
        fraud_score: newTransaction.fraud_score,
        fraud_reasons: fraudReasons
      });

    } catch (error) {
      resolve({
        transaction_id: transaction.transaction_id,
        status: 'failed',
        error: error.message
      });
    }
  });
}

// Main controller function remains the same
exports.validateTransactionBatch = async (req, res) => {
  try {
    const transactions = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'Batch processing requires an array of transactions'
      });
    }

    if (transactions.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Batch size exceeds maximum limit of 1000 transactions'
      });
    }

    const threadCount = Math.min(4, transactions.length);
    const chunkSize = Math.ceil(transactions.length / threadCount);
    const results = [];

    const workerPromises = [];
    for (let i = 0; i < threadCount; i++) {
      const chunk = transactions.slice(i * chunkSize, (i + 1) * chunkSize);
      
      workerPromises.push(new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: chunk
        });

        worker.on('message', (data) => {
          results.push(...data);
          resolve();
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
      }));
    }

    await Promise.all(workerPromises);

    res.status(200).json({
      success: true,
      processed: results.filter(r => r.status === 'processed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results: results
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Worker thread handler remains the same
if (!isMainThread) {
  (async () => {
    const chunkResults = await Promise.all(
      workerData.map(t => processTransaction(t))
    );
    parentPort.postMessage(chunkResults);
  })();
}


exports.transactionResponse = (req, res) => {

}