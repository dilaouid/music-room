const User      = require("../models/Users");
const passport  = require('passport'), facebookStrategy = require('passport-facebook').Strategy;
const express   = require("express");
const router    = express.Router();
const jwt       = require("jsonwebtoken");
const fbconfig = {
    facebook: {
        clientID:       process.env.FacebookClientID,
        clientSecret:   process.env.FacebookClientSecret,
        callbackURL:    `http://localhost:8080/authenticate/oauth/facebook/callback`,
    }
};
passport.serializeUser(function(user, done) { done(null, user) });
passport.deserializeUser(function(obj, done) { done(null, obj) });

router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    next();
});

passport.use( new facebookStrategy({
        clientID:       fbconfig.facebook.clientID,
        clientSecret:   fbconfig.facebook.clientSecret,
        callbackURL:    fbconfig.facebook.callbackURL,
        profileFields: [ 'id', 'email', 'name', 'gender', 'birthday', 'picture.type(large)' ]
    }, (accessToken, refreshToken, profile, done) => {
            User.findOne({ oauthID: profile.id }, (err, data) => {
                if (err) { return done(err) }
                if (data) {
                    return done(err, data);
                }
                else {
                    if (!profile._json.email) {
                        return done(err)
                    }
                    const oauthuser = new User({
                        email:      profile._json.email,
                        firstname:  profile._json.first_name ? profile._json.first_name : '',
                        lastname:   profile._json.last_name ? profile._json.last_name : '',
                        username:   profile.id,
                        birthday:   profile.user_birthday,
                        password:   null,
                        img:        profile.photos[0].value ? profile.photos[0].value : '',
                        oauthID:    profile.id,
                        hashtoken:  null,
                        facebook:   profile._json ? profile._json : {}
                    });
                    oauthuser.save( (err) => {
                        if (err) { console.log(err) }
                        return done(err, oauthuser)
                    })
                }
            })
        }
));

router.get('/facebook', passport.authenticate('facebook', { scope: ["public_profile", "email"] }));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: `http://localhost:8100/login`, scope: ["public_profile", "email"] }), (req, res) => {
    console.log('ici')
    User.findOne({ oauthID: req.user.oauthID }).then(async(user) => {
        if (!user) { return res.status(400).json({}); }
        const payload = { id: user.id };
        jwt.sign(payload, process.env.SECRET, { expiresIn: 31556926 },
            (err, token) => {
                if (!err) {
                    res.header('Access-Control-Allow-Credentials', true);
                    res.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000, secure: false,  httpOnly: false });
                    res.redirect(`http://localhost:8100`);
                } else {
                    console.log(err)
                    return res.status(400).json({});
                }
            }
        );
    });
});

module.exports = router;