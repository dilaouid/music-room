require('dotenv').config();
const mongoose      = require('mongoose');
const passport      = require("passport");
const helmet        = require("helmet");
const authenticate  = require('./middleware/authenticate');
const api           = require('./API/api');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const app           = express();
const bodyParser    = require('body-parser');

// Connect to mongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }).then(() => console.log('Connection with the DB is a success!'))
    .catch(err => { console.log(`DB Connection Error: ${err.message}`) });

// Write headers
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin',   req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});


// may be useful later
app.use(passport.initialize());

app.use('/authenticate', authenticate)
app.use('/api', api)

app.listen(process.env.PORT, () => {
    console.log(`Listening on PORT ${process.env.PORT}`);
});