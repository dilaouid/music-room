const express       = require('express');
const router        = express.Router();
const Event         = require("../models/Events");
const authentified  = require("../middleware/auth");

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
            res.json({statut: 400, res:'No events'})
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


module.exports = router;