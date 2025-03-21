const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  transaction_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  transaction_date: { 
    type: Date, 
    required: true 
  },
  transaction_amount: { 
    type: Number, 
    required: true 
  },
  transaction_channel: { 
    type: String, 
    enum: ["web", "mobile", "POS"], 
    required: true 
  },
  transaction_payment_mode: { 
    type: String, 
    enum: ["Card", "UPI", "NEFT", "IMPS", "Wallet", "Cash"], 
    required: true 
  },
  payment_gateway_bank: { 
    type: String, 
    required: true 
  },
  payer_email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address']
  },
  payer_mobile: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please use a valid 10-digit mobile number']
  },
  payer_card_brand: {
    type: String,
    enum: ["Visa", "MasterCard", "Amex", "Rupay", null],
    default: null
  },
  payer_device: {
    type: String,
    required: true
  },
  payer_browser: {
    type: String,
    enum: ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Other"],
    required: true
  },
  payee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Payee", 
    required: true 
  },
  fraud_score: {
    type: Number,
    min: 0,
    max: 100
  },
  is_fraudulent: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;