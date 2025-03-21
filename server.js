const express = require("express");

const handleTransaction = require("./routes/transaction");
const handleCmp = require("./routes/handleCmp");

const mongoose = require("mongoose");

require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3000;

// MongoDB connection

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.use("/api/transaction/:apikey", handleTransaction);
app.use("/api/cmpRegister", handleCmp);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "fraud_detection",
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successful database connection
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
