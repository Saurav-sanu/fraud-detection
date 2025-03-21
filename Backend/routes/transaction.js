const express = require("express");
const {
  validateTransactionData,
  validateTransactionBatch,
  transactionResponse,
} = require("../controllers/transaction");

const { authApi } = require("../middlewares/authMiddleware");
const { authenticate } = require("../middlewares/authenticate");

const router = express.Router();

router.post("/real_time",authenticate, authApi, validateTransactionData );

router.post("/batch",authenticate, authApi, validateTransactionBatch);

router.post("/response",authApi, transactionResponse);

module.exports = router;
