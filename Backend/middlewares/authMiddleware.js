// authMiddleware.js
const Company = require("../models/company");

const authApi = async (req, res, next) => {
  // Access the API key from the URL parameters
  const receivedApiKey = req.params.apikey; // Change this line

  if (!receivedApiKey) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: No API key provided",
    });
  }

  try {
    // Find company by API key
    const company = await Company.findOne({ apiKey: receivedApiKey });
    if (!company) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid API key",
      });
    }

    // Attach company to request object for subsequent middleware/routes
    req.company = company;
    next();
  } catch (error) {
    console.error("API Key Authentication Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

module.exports = { authApi };