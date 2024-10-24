const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, validate: {
        validator: function(v) {
            return v && v.length > 0;
        },
        message: 'Le mot de passe ne peut pas être vide'
    }}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);