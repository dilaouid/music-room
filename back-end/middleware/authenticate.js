const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken');
const cookieParser  = require('cookie-parser');
const Validator     = require("validator");
const bcrypt        = require("bcryptjs");
const sanitize      = require('mongo-sanitize');
const User          = require("../models/Users");
const validation    = require("../func/validation");

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
    let {error, valid} = validation.register(req.body);
    if (!{valid}) {
        return res.status(400).json(error);
    }
    User.findOne({$or: [{email: sanitize(req.body.email) }, {username: sanitize(req.body.username)} ] })
        .then( (err, user) => {
            if (err) {
                if (err.username && err.username === req.body.username) {
                    if (err.email && err.email === req.body.email)
                        return res.status(400).json({same_username: true, same_email: true});
                    return res.status(400).json({same_username: true, same_email: false});
                }
                return res.status(400).json({same_username: false, same_email: true});
            } else {
                
                let token = ( (+new Date) + Math.random() * 142).toString(32);
                let hashtoken = crypto.createHash('sha384').update(token).digest('hex');
                const registeredUser = new User({
                    username: sanitize(req.body.username),
                    email: sanitize(req.body.email),
                    password: sanitize(req.body.password),
                    birthday: sanitize(req.body.birthday),
                    hashtoken: hashtoken
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(registeredUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        registeredUser.password = hash;
                        registeredUser
                            .save()
                            .then(async(user) => {
                                try {
                                    const userFind = await User.findOne({_id: user.id});
                                    if (userFind) {
                                        // Immediately logs after registration, to delete after test
                                        jwt.sign( { id: userFind._id } , keys.SECRET, { expiresIn: 31556926, algorithm: 'HS256' }, (err, tok) => {
                                            if (!err) {
                                                res.cookie("token", tok, { maxAge: 300 * 1000 })
                                                return res.status(200).json({token: tok});
                                            } else {
                                                console.log(err)
                                                throw new Error(err);
                                            }
                                        })
                                    }
                                } catch (err) {
                                    console.log(err);
                                    return res.status(400).json({});
                                }
                            })
                            .catch(err => {console.log(err); return res.status(400).json({}) });
                    });
                });

            }
        });
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