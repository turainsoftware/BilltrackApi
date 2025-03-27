const { check } = require('express-validator');

exports.signUpValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email')
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: true }),
];
