const express       = require('express');
const router        = express.Router();
const cookieParser  = require('cookie-parser');

router.post('/login', (req, res) => {
    /* ###### LOGIN ACTION HERE ###### */
});

router.post('/register', (req, res) => {
    /* ###### REGISTER ACTION HERE ###### */
});

router.post('/forgot-password', (req, res) => {
    /* ###### SEND CODE TO EMAIL ACTION HERE ###### */
});

router.post('/check-code', (req, res) => {
    /* ###### CHECK CODE ACTION HERE ###### */
});

router.post('/new-password', (req, res) => {
    /* ###### NEW PASSWORD ACTION HERE ###### */
});

module.exports = router;