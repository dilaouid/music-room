const nodemailer    = require('nodemailer');
const author        = 'email@gmail.com';

var transporter     = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: author,
    pass: 'passworde'
  }
});

module.exports = { author, transporter };