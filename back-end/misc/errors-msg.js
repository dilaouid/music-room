const error_register_msg = {
        username: 'Username field is required',
        username_double: 'This username already exists',
        email_required: 'Email field is required',
        email_invalid: 'Email is invalid',
        email_double: 'This email already exists',
        password_invalid: 'Password must contain at least one uppercase, one number and one symbol, and at least 8 characters',
        password_confirm_invalid: 'Passwords must match',
        password_confirm: 'Confirm password field is required',
        birthday: 'Your birthday is required',
        wrong_birthday: 'Your birthday is invalid'
};

const events = {
        name: 'The name of the event is required',
        description: 'A description is required',
        localistation: 'Localisation is required',
        playlist: 'A playlist is required',
        date: 'The date is not valid'
};

const playlists = {
        name: 'The name of the playlist is required'
};


module.exports = { error_register_msg, events, playlists };