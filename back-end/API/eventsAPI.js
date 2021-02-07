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
    Event.findById( id ).then(async(event) => {
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
        res.json({statut: 400, res:'Invalid id'});
    });
});

router.get('/join/:id', authentified, async (req, res) => {
    const token = req.cookies.token;
    const infos = await getInfos(token);
    const id    = req.params.id;
    await Event.findById(id).then( async data => {
        if (data.members.includes(infos.id)) {
            await User.findByIdAndUpdate(infos.id, { $pull: { events: id }});
            data.members.pull(infos.id);
            data.admins.pull(infos.id);
        } else {
            await User.findByIdAndUpdate(infos.id, { $push: { events: id }});
            data.members.push(infos.id);
            data.admins.push(infos.id);
        }
        data.save();
    });
    res.json({statut: 200, res:'OK'});
});

router.get('/delete/:id', authentified, async (req, res) => {
    const token = req.cookies.token;
    const infos = await getInfos(token);
    const id    = req.params.id;
    await Event.findOne({_id: id, admins: {$in: infos.id} }).then(async data => {
        if (data) {
            await data.members.forEach(async (elm) => {
                await User.findById(elm).then(us => { us.events.pull(id); us.save(); })
            });
            await data.admins.forEach(async (ela) => {
                await User.findById(ela).then(us => { us.events.pull(id); us.save(); })
            });
        }
    });
    await Event.findOneAndRemove({_id: id, admins: {$in: infos.id} }).then(data => {
        if (data) { console.log(`${infos.username} deleted the event ${id}`); }
    });
    res.json({statut: 200, res:'OK'});
});

router.post('/update', urlencodedParser, authentified, async (req, res) => {
    const token     = req.cookies.token;
    const valid     = validation.events(req.body);
    const infos     = await getInfos(token);
    const username  = infos.username;
    const userid    = infos.id;
    const parts = req.body.date.split('/').map((p) => parseInt(p, 10));
    const formatDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const check     = await Event.findOne({_id: req.body.id}).then(data => {
        if (!data || !data.admins.includes(userid)) { return false; }
        return true;
    })
    if (check == false) { return res.json({statut: 400, res:'Access denied'}); }
    if (!valid.isValid) { return res.json({statut: 400, res:valid.errors });   }
    var membersParsed = req.body.members.length > 0 ? req.body.members.replace(/ /g,',').split(',') : [username];
    var adminsParsed  = req.body.admins.length  > 0 ? req.body.admins.replace(/ /g,',').split(',')  : [username];
    adminsParsed.forEach(el => { !membersParsed.includes(el) && el ? membersParsed.push(el) : ''; });
    var membersID   = [userid];
    var adminsID    = [userid];
    !adminsParsed.includes(username) ? adminsParsed.push(username) : '';
    for (let i = 0; i < membersParsed.length; i++) {
        await User.findOne({username : membersParsed[i]}, (err, data) => {
            if (data._id != userid) { membersID.push(data._id.toString()); }
            if (!data.events.includes(req.body.id)) { data.events.push(req.body.id) };
        });
    }
    for (let i = 0; i < adminsParsed.length; i++) {
        await User.findOne({username : adminsParsed[i]}, (err, data) => {
            if (data._id != userid) { adminsID.push(data._id.toString()); }
            if (!data.events.includes(req.body.id)) { data.events.push(req.body.id); }
        });
    }
    await Event.findById(req.body.id).then(data=>{
        data.name = req.body.name;
        data.description = req.body.description;
        data.date = formatDate;
        data.members = membersID;
        data.admins = adminsID;
        data.private = req.body.private;
        data.save();
    });
    console.log(`${username} updated the event ${req.body.name}`);
    return res.json({statut: 200, res:'OK'});
});

router.post('/new', urlencodedParser, authentified, async (req, res) => {
    const token         = req.cookies.token;
    const valid         = validation.events(req.body);
    const infos         = await getInfos(token);
    const parts = req.body.date.split('/').map((p) => parseInt(p, 10));
    const formatDate = new Date(parts[2], parts[1] - 1, parts[0]);
    var err = null;
    var playlistUsed    = req.body.playlist;
    var username        = infos.username;
    var userid          = infos.id;
    if (!valid.isValid) { res.json({ statut: 400, res:valid.errors }); }
    var membersParsed = req.body.members.length > 0 ? req.body.members.replace(/ /g,',').split(',') : [username];
    var adminsParsed  = req.body.admins.length > 0 ? req.body.admins.replace(/ /g,',').split(',') : [username];
    adminsParsed.forEach(el => { !membersParsed.includes(el) && el ? membersParsed.push(el) : ''; });
    var membersID   = [userid];
    var adminsID    = [userid];
    var newEvent = new Event({
        name:               sanitize(req.body.name),
        description:        sanitize(req.body.description),
        date:               formatDate,
        localisation:       sanitize(req.body.localisation),
        playlist:           sanitize(req.body.playlist),
        members:            membersID,
        admins:             adminsID,
        private:            req.body.private,
    });
    for (let i = 0; i < membersParsed.length; i++) {
        await User.findOne({username : membersParsed[i]}, (err, data) => {
            if (data) {
                if (data._id != userid) { membersID.push(data._id.toString()); }
                if (!data.events.includes(newEvent._id)) { data.events.push(newEvent._id.toString()) };
                data.save();
            }
        });
    }
    for (let i = 0; i < adminsParsed.length; i++) {
        await User.findOne({username : adminsParsed[i]}, (err, data) => {
            if (data) {
                if (data._id != userid) { adminsID.push(data._id.toString()); }
                if (!data.events.includes(newEvent._id)) { data.events.push(newEvent._id.toString()); }
                data.save();
            }
        });
    }
    await Playlist.findById(playlistUsed).then(async data => {
        if (!data || data.user != userid) { err = `This playlist cannot be used`; }
    }).catch(err => { console.log(err) });
    if (err) { res.json({ statut: 400, res: err }); }
    else {
        !adminsParsed.includes(username) ? adminsParsed.push(username) : '';
        newEvent.members    = membersID;
        newEvent.admins     = adminsID;
        newEvent.save();
        console.log(`${username} created the event '${newEvent.name}' (${newEvent._id.toString()})`);
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