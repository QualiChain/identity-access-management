const mongoose = require('mongoose');
const User = require('./user');
const CONFIRMED = 'confirmed';
const RECRUITER = 'recruiter';

// Student extra
const RecruiterSchema = mongoose.Schema({
    remaining_attempts: {
        type: Number,
        required: true,
        default: 3
    },
    password:  {
        type: String,
        required: true
    },

    roles:  {
        type: [String],
        default: RECRUITER,
        required: true
    },
    validation: {
        type: String,
        required: true,
        default: CONFIRMED
    },    description: {
        type: [String],
        required: false
    },
    location: {
        type: String,
        required: false
    },
    organization: {
        type: String,
        required: false
    },
    contact: {
        type: [String],
        required: false,
        unique: false
    }
});

const recruiter = module.exports = User.discriminator('recruiter', RecruiterSchema);