const express       = require('express');
const router        = express.Router();
const User          = require("../models/Users");
const authentified  = require("../middleware/auth");

router.get('/', authentified, (req, res) => {
    User.find( {}, {givenLikes: 0, givenDislikes: 0, admin: 0, oauthID: 0, password: 0, birthday: 0, hashtoken: 0, date: 0} ).then(async(user) => {
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

router.get('/:id', authentified, (req, res) => {
    const id = req.params.id;
    User.findById( id ).then(async(user) => {
        if (user) {
            res.json({statut: 200, data:{
                uuid: user._id,
                username: user.oauthID ? `${user.firstname} ${user.lastname}` : user.username,
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