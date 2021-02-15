const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken')
const bcrypt        = require("bcryptjs");
const sanitize      = require('mongo-sanitize');
const User          = require("../models/Users");
const authentified  = require("../middleware/auth");
const validation    = require("../func/validation");
const getInfos      = require("../func/getInfos");

function removeDuplicates(array) {
    return array.splice(0, array.length, ...(new Set(array)))
};

router.get('/', authentified, (req, res) => {
    User.find( {}, {givenLikes: 0, admin: 0, oauthID: 0, password: 0, birthday: 0, hashtoken: 0, date: 0} ).then(async(user) => {
        var usersList = [];
        if (user) {
            user.forEach(el => {
                usersList.push({
                    uuid: el._id,
                    username: el.oauthID ? `${el.firstname} ${el.lastname}` : el.username,
                    picture: el.img,
                    description: el.description,
                    playlist: el.playlists,
                    following: el.following,
                    followers: el.followers,
                    events: el.events,
                    musical_preferences: el.musical_preferences
                });
            });
            res.json({statut: 200, data: usersList});
        } else {
            res.json({statut: 404, res:'No users'})
        }
    });
});

router.get('/valid-token', authentified, (req, res) => {
    if (!req.cookies.token) {
        res.status(400).send({statut: 400, res:'Forbidden access: No token provided'});
    } else {
        jwt.verify(req.cookies.token, process.env.SECRET, async function(err, decoded) {
            if (err) {
                res.status(400).send({statut:400, res:'Forbidden access: Provided token is invalid'});
            }
        });
    }
    res.status(200).send({statut:200, res:'OK'});
});

router.get('/me', authentified, async (req, res) => {
    const   token         = req.cookies.token;
    var     infos         = await getInfos(token);
    var     userid        = infos.id;
    User.findById(userid).then((user) => {
        res.json({statut: 200, data:{
            uuid: user._id,
            username: user.username,
            picture: user.img,
            lastname: user.lastname,
            firstname: user.firstname,
            playlist: user.playlists,
            following: user.following,
            followers: user.followers,
            likes: user.givenLikes,
            events: user.events,
            musical_preferences: user.musical_preferences
        }});
    });
});

router.get('/follow/:id', authentified, async (req, res) => {
    const   token         = req.cookies.token;
    const   followID      = req.params.id;
    var     infos         = await getInfos(token);
    var     userid        = infos.id;
    await User.findById(userid).then(async (user) => {
        if (user.following.includes(followID)) {
            User.findByIdAndUpdate(followID, { $pull: { followers: userid }}, (err, model) => {
                if (model) {
                    console.log(`${userid} stopped following ${followID}`);
                    user.following.pull(followID);
                    user.save();
                }
            });
        } else {
            User.findByIdAndUpdate(followID, { $push: { followers: userid }}, (err, model) => {
                if (model) {
                    console.log(`${userid} follows ${followID}`);
                    user.following.push(followID);
                    user.save();
                }
            });
        }
    });
    res.json({statut: 200, res: 'OK'});
});

router.get('/:id', authentified, (req, res) => {
    const id = req.params.id;
    User.findById( id ).then(async(user) => {
        if (user) {
            res.json({statut: 200, data:{
                uuid: user._id,
                username: user.username,
                picture: user.img,
                description: user.description,
                playlist: user.playlists,
                following: user.following,
                followers: user.followers,
                events: user.events,
                musical_preferences: user.musical_preferences
            }});
        } else {
            res.json({statut: 400, res:'User not found'})
        }
    }).catch(err =>  {
        return res.json({statut: 400, res:'Invalid id'});
    });
});


router.post('/update', authentified, async (req, res) => {
    const   token           = req.cookies.token;
    var     infos           = await getInfos(token);
    var     userid          = infos.id;
    var     updatePassword  = req.body.password.length > 0;
    var     updateFirstname = req.body.firstname.length > 0;
    var     updateLastname  = req.body.lastname.length > 0;
    var     updateUsername  = req.body.username.length > 0;
    var     updatePreferen  = req.body.preferences.length > 0;
    if (updatePassword) {
        let {error, valid} = validation.updateUser(req.body);
        if (!{valid}) { return res.json({statut: 204, msg: error}); }
    }
    await User.findById(userid).then(async data => {
        if (updatePassword) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(data.password, salt, (err, hash) => {
                    if (err) throw err;
                    data.password = hash;
                });
            });
        }
        if (updateUsername) {
            var existUser = await User.findOne({username: req.body.username}).then(us => {
                if (us) { return true; }
                else { return false; }
            })
            if (!existUser) { data.username  = req.body.username; }
            else { return res.json({statut: 204, msg: 'This username is already taken by someone else!'})  }
        }
        if (updatePreferen) {
            var preferences = req.body.preferences.replace(/ /g,' ').split(' ');
            var filteredPref = removeDuplicates(preferences);
            if (filteredPref != data.musical_preferences) { data.musical_preferences = filteredPref; }
        }
        updateFirstname ? data.firstname = req.body.firstname : data.firstname = data.firstname;
        updateLastname  ? data.lastname  = req.body.lastname  : data.lastname  = data.lastname;
        data.save();
        console.log(`${data.username} updated his profile!`);
        return res.json({statut: 200, msg:'Profile updated!'})
    });
});

module.exports = router;