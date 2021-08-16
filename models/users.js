const { Schema, model } = require("mongoose");

const usersSchema = new Schema({
    username: {
        type: String,
        trim: true,
        required: "Expected a string of text but got none.",
        unique: true,
        maxlength: [30, "Must be atmost 30 characters long."],
    },
});

module.exports = model("Users", usersSchema);
