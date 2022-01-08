const mongoose = require('mongoose')
const validator = require('validator')
const noteSchema = {
    note: {
        type: String,
        required: true,
        trim: true,
    },
}
const Note = mongoose.model("Note", noteSchema)

module.exports = Note