const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken')
const User          = require("../models/Users");
const authentified  = require("../middleware/auth");
const getInfos      = require("../func/getInfos");

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
                    events: el.events
                });
            });
            res.json({statut: 200, data: usersList});
        } else {
            res.json({statut: 400, res:'No users'})
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
            description: user.description,
            playlist: user.playlists,
            following: user.following,
            followers: user.followers,
            events: user.events
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
                events: user.events
            }});
        } else {
            res.json({statut: 400, res:'User not found'})
        }
    }).catch(err =>  {
        return res.json({statut: 400, res:'Invalid id'});
    });
});

module.exports = router;