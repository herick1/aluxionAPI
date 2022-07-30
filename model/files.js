const mongoose = require('mongoose');

const files = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    fieldname: {
        type: String,
    },
    originalname: {
        type: String,
    },
    location: {
        type: String,
    },
    key: {
        type: String,
    }
});

module.exports = mongoose.model('files', files);