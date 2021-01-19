const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken');
const crypto        = require('crypto');
const bcrypt        = require("bcryptjs");
const sanitize      = require('mongo-sanitize');
const User          = require("../models/Users");
const validation    = require("../func/validation");
const oauth         = require('./oauth');
const cookieParser  = require('cookie-parser');

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
/* ############# ######### ############# */

router.post('/login', (req, res) => {

    const username = req.body.username;
    var password = req.body.password;

    User.findOne( {username} ).then(async(user) => {
        if (!user || (user && !user.password))
            return res.json({statut: 204, msg: 'Invalid login or password', alert:'danger'});
        else if (user.hashtoken != null)
            return res.json({statut: 204, msg: 'Please check your mail in order to complete your registration to 10H.', alert:'info'});
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                const payload = {id: user.id};
                jwt.sign(payload, process.env.SECRET, {expiresIn: 31556926}, (err, token) => {
                    if (!err) {
                        res.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000, domain: 'localhost', secure: false, sameSite: true, httpOnly: false });
                        return res.json({statut: 200, msg: null, alert:'success'});
                    }
                    console.log(err);
                    return res.json({statut: 204, msg: 'An error occured', alert:'danger'});
                })
            } else {
                console.log(`No match for ${username} - ${password}`);
                return res.json({statut: 204, msg:'Invalid login or password', alert:'danger'});
            }
        });
    });
});

router.post('/register', (req, res) => {
    let {error, valid} = validation.register(req.body);
    if (!{valid}) {
        return res.json({statut: 204, msg:error});
    }
    User.findOne({$or: [{email: sanitize(req.body.email) }, {username: sanitize(req.body.username)} ] })
        .then( (err, user) => {
            if (err) {
                if (err.username && err.username === req.body.username) {
                    if (err.email && err.email === req.body.email)
                        return res.json({statut: 204, msg: 'An account alreay exists with this email address and username', alert:'warning'});
                    return res.json({statut: 204, msg: 'An account alreay exists with this username', alert:'warning'});
                }
                return res.json({statut: 204, msg: 'An account alreay exists with this email address', alert:'warning'});
            } else {
                let token = ( (+new Date) + Math.random() * 142).toString(32);
                let hashtoken = crypto.createHash('sha384').update(token).digest('hex');
                const parts = req.body.birthday.split('/').map((p) => parseInt(p, 10));
                parts[1] -= 1;
                const formatBirthday = new Date(parts[2], parts[1], parts[0]);
                const registeredUser = new User({
                    username:   sanitize(req.body.username),
                    email:      sanitize(req.body.email),
                    password:   sanitize(req.body.password),
                    birthday:   formatBirthday,
                    hashtoken:  hashtoken
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(registeredUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        registeredUser.password = hash;
                        registeredUser.save();
                    });
                });
                const link          = `${process.env.FRONT}/validate?token=${hashtoken}`;
                const mailOptions   = {
                    from:       process.env.EMAIL,
                    to:         req.body.email,
                    subject:    'Validate your 10H account right now!',
                    text:       `Hello ${req.body.username}! In order to validate your 10H account, you need to click in the following link: ${link} Enjoy the music!`,
                    html:       `<p>Hello ${req.body.username}!<br>In order to validate your 10H account, <strong>you need to click in the following link:</strong><br><a href="${link}">I want to join 10H right now!</a><br>Enjoy the music!</p>`,
                }
                ts.transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('MAIL ERROR: ' + error);
                        console.log(`username: ${process.env.EMAIL}\npassword: ${process.env.EMAILPASS}`);
                        return res.json({statut: 204, msg: 'An error occured, please try again', alert:'danger'});
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        return res.json({statut: 200, msg: 'Your account has been created! Please check your email in order to validate your account!', alert:'info'});
                    }
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

router.get('/logout', authentified, (req, res) => {
    res.clearCookie('token')
    .sendStatus(200);
});

router.get('/validate/:hashtoken', async (req, res) => {
    const hash = req.params.hashtoken;
    try {
        var msg;
        await User.findOneAndUpdate({hashtoken: hash}, {hashtoken: null}).then(res => {
            if (!res) {
                msg = 'The token is invalid';
            } else {
                msg = 'Your account has been verified.<br>You will be redirected';
            }
        }).catch(err => {
            console.log(err);
        });
        return res.json({msg: msg});
    } catch(err) {
        console.log(err)
    }
});
router.use('/oauth', oauth);

module.exports = router;