const jwt = require('jsonwebtoken')


/* ############# FUNCTIONS ############# */
const authentified = (req, res, next) => {
    let token;
    if (req.params.token && !req.cookies.token) {
        token = req.params.token;
    } else {
        token = req.cookies.token;
    }
    if (!token) {
        res.status(400).send({statut: 400, res:'Forbidden access: No token provided'});
    } else {
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) {
                res.status(400).send({statut:400, res:'Forbidden access: Provided token is invalid'});
            } else {
                res.locals.id = decoded.id;
                next();
            }
        });
    }
};
/* ############# ######### ############# */

module.exports = authentified;