const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken');
const cookieParser  = require('cookie-parser');
const Validator     = require("validator");
const bcrypt        = require("bcryptjs");
const sanitize      = require('mongo-sanitize');

/* ############# FUNCTIONS ############# */
const authentified = (req, res, next) => {
    let token;
    if (req.params.token && !req.cookies.token) {
        token = req.params.token;
    } else {
        token = req.cookies.token;
    }
    if (!token) {
        res.status(400).send('Forbidden access: No token provided');
    } else {
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) {
                res.status(400).send('Forbidden access: Provided token is invalid');
            } else {
                res.locals.id = decoded.id;
                next();
            }
        });
    }
};

/* ############# FUNCTIONS ############# */

router.post('/login', (req, res) => {
    const username = req.body.username;
    var password = req.body.password;

    User.findOne( {username} ).then(async(user) => {
        if (!user || user && !user.password)
            return res.status(400).json({});
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                const payload = {id: user.id};
                jwt.sign(payload, keys.secretKey, {expiresIn: 31556926}, (err, token) => {
                    if (!err) {
                        res.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000, domain: 'localhost', secure: false, sameSite: true, httpOnly: false });
                        return resizeTo.status(200).json({});
                    }
                    console.log(err);
                    return res.status(400).json({});
                })
            } else
                return res.status(400).json({});
        });
    });
});

router.post('/register', (req, res) => {
    /* ###### REGISTER ACTION HERE ###### */
});

router.post('/forgot-password', (req, res) => {
    /* ###### SEND CODE TO EMAIL ACTION HERE ###### */
});

router.post('/check-code', (req, res) => {
    /* ###### CHECK CODE ACTION HERE ###### */
});

router.post('/new-password', (req, res) => {
    /* ###### NEW PASSWORD ACTION HERE ###### */
});

router.get ('/logout', authentified, (req, res) => {
    res.clearCookie('token')
    .sendStatus(200);
});

module.exports = router;