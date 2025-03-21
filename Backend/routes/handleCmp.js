const express = require("express");

const { cmpRegister, cmpLogin } = require("../controllers/cmpRegister");

// const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", cmpRegister);

router.post("/login", cmpLogin);


module.exports = router;
