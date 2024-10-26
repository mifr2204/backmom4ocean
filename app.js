//var createError = require('http-errors');
//var express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const authRoutes = require("./routes/authRoutes");
const Workplace = require("./models/Workplace");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");  

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//var app = express();

//inställningar för databasen
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

//routes
app.use("/api", authRoutes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//validate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) res.status(401).json({ message: "Token is missing" });
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
        if(err) return res.status(401).json({ message: "JWT is not correct" });

        req.username = username;
        next();
    })
}

//get all workplaces
app.get("/workplaces", authenticateToken, async(req, res) => {
    try {
        let result = await Workplace.find({});

        return res.json(result);
    }catch(error) {
        return res.status(500).json(error);
    }
});

//radera arbetsplats
app.delete("/workplaces/:id", authenticateToken, async(req, res) => {
    
    try {
        let id = req.params.id;
        
        let result = await Workplace.deleteOne({_id: id}); 
        
        res.json({message: "The workplace is deleted ", id});    
    
    }catch(error) {
        //console.log(error);
        return res.status(400).json(error);
    };
});

//skickar till databasen
app.post("/workplaces", authenticateToken, async(req, res) => {
    try {
        let result = await Workplace.create(req.body);
        return res.json(result);
    }catch(error) {
        return res.status(400).json(error);
    }
});

app.put("/workplaces/:id", authenticateToken, async(req, res) => {
    try {
        let id = req.params.id;
        let companyname = req.body.companyname;
        let location = req.body.location;
        let startdate = req.body.startdate;
        let enddate = req.body.enddate;
        let title = req.body.title;
        let description = req.body.description;
       
        let result = await Workplace.findOne({_id: id});
            result.companyname = companyname; 
            result.location = location; 
            result.startdate = startdate; 
            result.enddate = enddate;
            result.title = title;
            result.description = description;
            result.save().then((data) => {
                return res.status(200).json(data);
            }, (error) => {
                return res.status(400).json(error);
            });
        
    }catch(error) {
       return res.status(500).json(error);
    };
});

//Start av applikationen
app.listen(port, () => {
  console.log("Started on port: " + port);
});

module.exports = app;