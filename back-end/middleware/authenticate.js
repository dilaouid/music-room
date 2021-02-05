const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken');
const crypto        = require('crypto');
const bcrypt        = require("bcryptjs");
const sanitize      = require('mongo-sanitize');
const User          = require("../models/Users");
const authentified  = require("./auth");
const validation    = require("../func/validation");
const oauthfacebook = require('./oauth-facebook');
const oauthgoogle   = require('./oauth-google');
const cookieParser  = require('cookie-parser');

const passwordValidator   = require('password-validator');
const ts            = require('../misc/nodemailer')

router.post('/login', (req, res) => {

    const username = req.body.username;
    var password = req.body.password;

    User.findOne( {username} ).then(async(user) => {
        if (!user || (user && !user.password))
            return res.json({statut: 204, msg: 'Invalid login or password', alert:'danger'});
        else if (user.hashtoken && user.hashtoken.length > 0)
            return res.json({statut: 204, msg: 'Please check your mail in order to complete your registration to 10H.', alert:'info'});
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                const payload = {id: user.id};
                user.passtoken = '';
                user.save();
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
                const link = `${process.env.FRONT}/validate?token=${hashtoken}`;
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
                        console.log(`New user: ${req.body.username}`);
                        console.log('Email sent: ' + info.response);
                        return res.json({statut: 200, msg: 'Your account has been created! Please check your email in order to validate your account!', alert:'info'});
                    }
                });
            }
        });
});

router.post('/forgot-password', async (req, res) => {
    const token = crypto.createHash('sha384').update(( (+new Date) + Math.random() * 142).toString(32)).digest('hex');
    const link = `${process.env.FRONT}/new-password?passtoken=${token}`;
    const mailOptions   = {
        from:       process.env.EMAIL,
        to:         req.body.email,
        subject:    'You forgot it? No problem!',
        text:       `Hello sleepy head! I've heard that you forgot your password? No problem, you can retrieve it here: ${link} Enjoy the music!`,
        html:       `<p>Hello sleepy head!<br>I've heard that you forgot your password? No problem, you can retrieve it here: </strong><br><a href="${link}">I want to create a new password!</a><br>Enjoy the music!</p>`,
    }
    return await User.findOneAndUpdate({email: req.body.email}, { $set: { passtoken: token } }).then((model, err) => {
        if (!model) {
            return res.json({ret: 400, msg: 'This email does not exists in 10H!', alert:'danger'});
        } else {
            ts.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('MAIL ERROR: ' + error);
                    console.log(`username: ${process.env.EMAIL}\npassword: ${process.env.EMAILPASS}`);
                    return res.json({statut: 204, msg: 'An error occured, please try again', alert:'danger'});
                }
                else {
                    console.log('E mail sent: ' + info.response);
                    return res.json({ret: 200, msg: 'A link has been sent to your email adress to retrieve your password!', alert:'success'});
                }
            });
        }
    });
});

router.post('/new-password', async (req, res) => {
    /* ###### NEW PASSWORD ACTION HERE ###### */
    const token     = req.body.token;
    const newpass   = req.body.password;
    var schema = new passwordValidator();
    schema.is().min(8)
            .is().max(30)
            .has().uppercase()
            .has().lowercase()
            .has().digits()
            .has().symbols();
    if (schema.validate(newpass)) {
        return await User.findOne({passtoken: token}, async (err, user) => {
            if (err) { console.log(err); }
            else if (user) {
                await bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newpass, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        user.passtoken = '';
                        user.save();
                    });
                });
                console.log(`${user.username} changed his password !`)
                return res.json({statut: 200, msg: "The password has been successfully changed!", alert:"success"});
            } else {
                return res.json({statut: 204, msg: "The token expired or is invalid!", alert:"danger"});
            }
        });
    } else {
        return res.json({statut: 204, msg: "The password format is incorrect! 8 characters min, 1 uppercase, 1 lowercase, 1 number and 1 symbol are required", alert:"danger"});
    }
});

router.get('/new-password/:token', async (req, res) => {
    /* ###### CHECK TOKEN ###### */
    const token = req.params.token;
    return await User.findOne({passtoken: token}, (err, data) => {
        if (err) { console.log(err); }
        if (data) {
            return res.json({res: 200, username: data.username});
        } else {
            return res.json({res: 404});
        }
    });
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
router.use('/oauth/facebook', oauthfacebook);

module.exports = router;