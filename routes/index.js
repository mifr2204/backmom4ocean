var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const Workplace = require("../models/Workplace");

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log("aa");
  if(token == null) res.status(401).json({ message: "Token is missing" });
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
      if(err) return res.status(401).json({ message: "JWT is not correct" });

      req.username = username;
      next();
  })
};

/* GET home page. */
router.get("/workplaces", authenticateToken, async(req, res) => {
  try {
      let result = await Workplace.find({});

      return res.json(result);
  }catch(error) {
      return res.status(500).json(error);
  }
});

module.exports = router;
