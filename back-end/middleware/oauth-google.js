const express   = require("express");
const router    = express.Router();
const metadata  = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');
const keys      = require('./oauth2.keys.json');

const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
);
const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
});


router.get('/callback', async (req, res) => {
    const qs = new url.URL(req.url, `http://localhost:${process.env.PORT}`)
              .searchParams;
    const code = qs.get('code');
    const r = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(r.tokens);
    resolve(oAuth2Client);
});
        
module.exports = router;