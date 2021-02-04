const User          = require("../models/Users");
const jwt           = require('jsonwebtoken');

const getInfos = ( async (token) => {
    var usernameByToken;
    await jwt.verify(token, process.env.SECRET, async function(err, decoded) {
        if (err) {
            res.status(400).send('Forbidden access: Provided token is invalid');
        } else {
            usernameByToken = await User.findById(decoded.id).then( async (data) => {
                if (data) {
                    return { username: data.username, id: decoded.id } ;
                }
            });
        }
    });
    return (usernameByToken)
});

module.exports = getInfos;