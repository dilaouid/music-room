const express       = require('express');
const router        = express.Router();
const Event         = require("../models/Events");
const User          = require("../models/Users");
const Playlist      = require("../models/Playlists");
const authentified  = require("../middleware/auth");
const validation    = require("../func/validation");
const getInfos      = require("../func/getInfos");
const sanitize      = require("mongo-sanitize");
const bodyParser    = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});


router.get('/', authentified, (req, res) => {
    const token = req.cookies.token;
    Event.find( {} ).then(async(event) => {
        var eventList = [];
        if (event) {
            event.forEach(el => {
                if (el.private == 1 && (el.creator != token || !el.admins.includes(token))) {
                    console.log(`${el._id} hidden from ${token}`);
                } else {
                    eventList.push({
                        id:             el._id,
                        name:           el.name,
                        description:    el.description,
                        creation:       el.creation,
                        date:           el.date,
                        playlist:       el.playlist,
                        members:        el.members,
                        privileges:     el.admins,
                        localisation:   el.localisation
                    });
                }
            });
            res.json({statut: 200, data: eventList});
        } else {
            res.json({statut: 400, res: 'No events'})
        }
    });
});

router.get('/:id', authentified, (req, res) => {
    const id = req.params.id;
    Music.findById( id ).then(async(event) => {
        if (event && (event.private == 0 || (el.private == 1 && (el.creator != token || !el.admins.includes(token))) ) ) {
            res.json({statut: 200, data:{
                id:             event._id,
                name:           event.name,
                description:    event.description,
                creation:       event.creation,
                date:           event.date,
                playlist:       event.playlist,
                members:        event.members,
                privileges:     event.admins,
                localisation:   event.localisation
            }});
        } else {
            res.json({statut: 400, res:'You don\'t have the permission to see this information'});
        }
    }).catch(err =>  {
        console.log(err)
        return res.json({statut: 400, res:'Invalid id'});
    });
});

router.post('/new', urlencodedParser, authentified, async (req, res) => {
    const token         = req.cookies.token;
    const valid         = validation.events(req.body);
    const infos         = await getInfos(token);
    var err = null;
    var playlistUsed    = req.body.playlist;
    var username        = infos.username;
    var userid          = infos.id;
    if (!valid.isValid) { res.json({ statut: 400, res:valid.errors }); }
    var membersParsed = req.body.members.length > 0 ? req.body.members.replace(/ /g,'').split(',') : [username];
    var adminsParsed  = req.body.admins.length > 0 ? req.body.admins.replace(/ /g,'').split(',') : [username];
    adminsParsed.forEach(el => { !membersParsed.includes(el) && el ? membersParsed.push(el) : ''; });
    var membersID   = [userid];
    var adminsID    = [userid];
    await User.find({"username" : {$in : membersParsed, $exists: true, $ne: null}}, (err, data) => {
        membersID.includes(data._id) ? '' : membersID.push(data._id);
    });
    await User.find({"username" : {$in : adminsParsed, $exists: true, $ne: null}}, (err, data) => {
        adminsID.includes(data._id) ? '' : adminsID.push(data._id);
    });
    await Playlist.findById(playlistUsed).then(async data => {
        if (!data || data.user != userid) { err = `This playlist cannot be used`; }
    }).catch(err => { console.log(err) });
    if (err) { res.json({ statut: 400, res: err }); }
    else {
        !adminsParsed.includes(username) ? adminsParsed.push(username) : '';
        const parts = req.body.date.split('/').map((p) => parseInt(p, 10));
        parts[1] -= 1;
        const formatDate = new Date(parts[2], parts[1], parts[0]);
        const newEvent = new Event({
            name:               sanitize(req.body.name),
            description:        sanitize(req.body.description),
            date:               formatDate,
            localisation:       sanitize(req.body.localisation),
            playlist:           sanitize(req.body.playlist),
            members:            membersID,
            admins:             adminsID,
            private:            req.body.private,
        }).save();
        res.json({statut: 200, data:{
            name:               sanitize(req.body.name),
            description:        sanitize(req.body.description),
            date:               formatDate,
            localisation:       sanitize(req.body.localisation),
            playlist:           sanitize(req.body.playlist),
            members:            membersParsed,
            admins:             adminsParsed,
            private:            req.body.private
        }});
    }
});

module.exports = router;