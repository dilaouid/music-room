const Validator         = require("validator");
const isEmpty           = require("is-empty");
const cookieParser      = require('cookie-parser');
const registerError     = require('../misc/errors-msg').error_register_msg;
const playlistsError     = require('../misc/errors-msg').playlists;
const eventsError       = require('../misc/errors-msg').events;
var passwordValidator   = require('password-validator');

var schema = new passwordValidator();
    schema
    .is().min(8)
    .is().max(30)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols();

const isValidDate = (s) => {
    if ( ! /^\d\d\/\d\d\/\d\d\d\d$/.test(s) ) {
        return false;
    }
    const parts = s.split('/').map((p) => parseInt(p, 10));
    parts[1] -= 1;
    const d = new Date(parts[2], parts[1], parts[0]);
    const today = new Date();
    return (d.getMonth() === parts[1] && d.getDate() === parts[0] && d.getFullYear() === parts[2]) && (today.getFullYear() - d.getFullYear() > 15);
}

const register = (data) => {
        let errors = {};
        data.username           = !isEmpty(data.username) ? data.username : "";
        data.email              = !isEmpty(data.email) ? data.email : "";
        data.password           = !isEmpty(data.password) ? data.password : "";
        data.confirm_password   = !isEmpty(data.confirm_password) ? data.confirm_password : "";
        data.birthday           = !isEmpty(data.birthday) ? data.birthday : "";
    
        if (Validator.isEmpty(data.username)) errors.username = registerError.username;
        if (!schema.validate(data.password)) errors.password = registerError.firstname;
        if (Validator.isEmpty(data.confirm_password)) errors.confirm_password = registerError.confirm_password;
        if (!Validator.equals(data.password, data.confirm_password)) errors.confirm_password = registerError.confirm_password;
        if (Validator.isEmpty(data.birthday)) errors.birthday = registerError.birthday;
        if (!isValidDate(data.birthday)) errors.birthday = registerError.wrong_birthday;
        if (Validator.isEmpty(data.email) || !Validator.isEmail(data.email))
            errors.email = registerError.email_invalid;
        return {
            errors,
            isValid: !isEmpty(errors)
        };
};

const events = (data) => {
    let errors = {};
    data.name           = !isEmpty(data.name) ? data.name : "";
    data.description    = !isEmpty(data.description) ? data.description : "";
    data.date           = !isEmpty(data.date) ? data.date : "";
    data.localisation   = !isEmpty(data.localisation) ? data.localisation : "";
    data.playlist       = !isEmpty(data.playlist) ? data.playlist : "";

    if (Validator.isEmpty(data.name)) errors.name = eventsError.name;
    if (Validator.isEmpty(data.description)) errors.description = eventsError.description;
    if (Validator.isEmpty(data.localisation)) errors.localisation = eventsError.localisation;
    if (Validator.isEmpty(data.playlist)) errors.playlist = eventsError.playlist;
    if (!isValidDate(data.date)) errors.date = eventsError.date;
    return {
        errors,
        isValid: !isEmpty(errors)
    };
}

const playlists = (data) => {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : "";

    if (Validator.isEmpty(data.name)) { errors.name = playlistsError.name; console.log('lol'); }
    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports = { register, events, playlists };