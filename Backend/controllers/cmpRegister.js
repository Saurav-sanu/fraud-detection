const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company");

const { v4: uuidv4 } = require('uuid');

exports.cmpRegister = async (req, res) => {
  const { companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const existingCompany = await Company.findOne({ email }).select('+password');
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const apiKey = uuidv4();
    const baseURL = "http://localhost:3000/api/transaction"; // Consider using environment variable
    
    // Generate URLs with API key
    const endpoints = [
      `${baseURL}/${apiKey}/real_time`,
      `${baseURL}/${apiKey}/batch`,
      `${baseURL}/${apiKey}/response`
    ];

    const newCompany = await Company.create({
      companyName,
      email,
      password,
      apiKey,
      urls: endpoints
    });

    const companyData = {
      _id: newCompany._id,
      companyName: newCompany.companyName,
      email: newCompany.email,
      apiKey: newCompany.apiKey,
      urls: newCompany.urls,
      createdAt: newCompany.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: companyData
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};


// login 

exports.cmpLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    // Find company with password field
    const company = await Company.findOne({ email }).select('+password');

    if (!company) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { companyId: company._id, email: company.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Prepare response data
    const companyData = {
      _id: company._id,
      companyName: company.companyName,
      email: company.email,
      apiKey: company.apiKey,
      urls: company.urls,
      createdAt: company.createdAt
    };

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      data: companyData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};