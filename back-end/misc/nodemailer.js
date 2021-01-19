const nodemailer    = require('nodemailer');

const transporter   = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS
  }
});

module.exports = { transporter };