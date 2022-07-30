const express = require('express');
const mongoose = require('mongoose');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession)
const passport = require('passport');
const flash = require('connect-flash');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const cors = require("cors");
const s3Route = require("./route/S3Route");
const unsplashapi = require("./route/unsplashAPI");

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views',);

app.use(express.urlencoded({ extended: true }));

const mongoURI = require('./config/monkoKEY');
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true, },).then(() => console.log("Connected !"),);

app.use(cookieParser('random'));

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    // setting the max age to longer duration
    maxAge: 24 * 60 * 60 * 1000,
    store: new MemoryStore(),
}));

//app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

app.use(require('./controller/routes.js'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/file", s3Route);
app.use("/unsplash", unsplashapi);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started At " + PORT));