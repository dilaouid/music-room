const Validator         = require("validator");
const isEmpty           = require("is-empty");
const cookieParser      = require('cookie-parser');
const error_msg         = require('../misc/errors-msg').error_register_msg;
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
    parts[0] -= 1;
    const d = new Date(parts[2], parts[0], parts[1]);
    return d.getMonth() === parts[0] && d.getDate() === parts[1] && d.getFullYear() === parts[2];
}

const register = (data) => {
        let errors = {};
        data.username           = !isEmpty(data.username) ? data.username : "";
        data.email              = !isEmpty(data.email) ? data.email : "";
        data.password           = !isEmpty(data.password) ? data.password : "";
        data.confirm_password   = !isEmpty(data.confirm_password) ? data.confirm_password : "";
        data.birthday           = !isEmpty(data.birthday) ? data.birthday : "";
    
        if (Validator.isEmpty(data.username)) errors.username = error_msg.username;
        if (!schema.validate(data.password)) errors.password = error_msg.firstname;
        if (Validator.isEmpty(data.confirm_password)) errors.confirm_password = error_msg.confirm_password;
        if (!Validator.equals(data.password, data.confirm_password)) errors.confirm_password = error_msg.confirm_password;
        if (Validator.isEmpty(data.birthday)) errors.birthday = error_msg.birthday;
        if (!isValidDate(data.birthday)) errors.birthday = error_msg.wrong_birthday;
        if (Validator.isEmpty(data.email) || !Validator.isEmail(data.email))
            errors.email = error_msg.email_invalid;
        return {
            errors,
            isValid: !isEmpty(errors)
        };
};

module.exports = { register };