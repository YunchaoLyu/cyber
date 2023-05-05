var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

const { check, validationResult } = require('express-validator');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
require("dotenv").config();
app.get("/", (req, res) => {
    res.render("index.html");
  });

const mongoose = require("mongoose");
const mongoDB = "mongodb://localhost:27017/testdb"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));
const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})
const todoSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    items: [{
      type: String,
      required: true
    }]
})
var Expressjwt=require("express-jwt");
const bcrypt = require('bcryptjs')
userSchema.pre('save', function (next) {
    const user = this
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err)
        }
        user.password = hash
        next()
    })
})
const User = mongoose.model('User', userSchema)
const Todo = mongoose.model("Todo", todoSchema);
app.use(
    "/api/todos",
    Expressjwt.expressjwt({
    secret:process.env.SECRET,
    algorithms:["HS256"],
  })
  )
app.post('/api/user/register', [
    check('email').isEmail().withMessage('Invalid email format'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+={}[]|\;:"<>,.\/?])/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json("Password is not strong enough");
    }

    const newUser = new User({
        email: req.body.email,
        password:req.body.password
    })
    newUser.save((err) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(403).json('Email already in use')
            }
            return res.status(500).send(err)
        }
        res.send({
            success: true,
          });
    })
});
const jwt = require("jsonwebtoken")

app.post("/api/todos", (req, res) => {
    var idemail = req.headers.authorization
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    
    let id = jwt.decode(idemail);
    
    const { items } = req.body;
    if (!decoded.email) {
        return res.status(401).send("unauthorized");
    }
    else {
        
        Todo.findOne({ email: decoded.email }, (err, user1) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal server error");
            }
            if (!user1) {
                new Todo({
                    user: decoded._id,
                    items: items
                }).save(function (err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Internal server error");
                    }
                });
            } else {
                user1.items = user1.items.concat(items)
                user1.save(function (err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Internal server error");
                    }
                });
                res.json({items:user1.items});
            }
        });

    }
});
  

app.post("/api/user/login", (req, res) => {
    const { email, password } = req.body
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            })
        }
    
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({
                    success: false,
                    msg: "Invalid credentials"
                })
            }
            const token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET)
            return res.json(
            
                {success:true,
                    token
                })
        })
    })
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });
})


app.post("/api/private", (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    try {
    const decoded = jwt.verify(token, process.env.SECRET);
    if (!decoded.email) {
    return res.status(401).send("unauthorized");
    } else {
        Todo.findOne({ email: decoded.email }, (err, user) => {
            if(err) throw err
            if(!user){
              res.json({
              email: decoded.email,
              items: []
            })}
            else{
        
              res.json({email:decoded.email, items: user.items});
          
            }
        })
    }
    } catch (err) {
    return res.status(401).send("unauthorized");
    }
    });
// app.post("/api/private", (req, res) => {
  
//     if(!req.auth.email){
//       res.send("unauthorized");
//     }
//     console.log("hello")
//     console.log(req.auth.email)
//     var aa = req.auth.email;
//     console.log(aa)
//     Todo.findOne({ user: req.auth.id}, (err, user) => {
//       if(err) throw err
//       if(!user){
//         res.json({
//         email: aa,
//         items: []
//       })}
//       else{
  
//         res.json({email:aa, items: user.items});
    
//       }
//   })    
// });    


app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid token');
    }
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
