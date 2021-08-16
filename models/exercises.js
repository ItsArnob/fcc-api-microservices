const { Schema, model } = require("mongoose");

const exerciseSchema = new Schema({
    description: {
        type: String,
        trim: true,
        required: "Expected a string of text but got none.",
        maxlength: [40, "Must be atmost 40 characters long."],
    },
    duration: {
        type: Number,
        required: "Expected a number but got none.",
        min: [1, "Must be 1 or higher."],
    },
    date: {
        type: Date,
        default: () => Date.now(),
        validate: {
            validator: (date) => {
                return new Date(date) > new Date() ? false : true;
            },
            message: "Time-travelling to the future is not allowed.",
        },
    },
    userID: {
        type: String,
        required: true,
        index: true,
    },
});

module.exports = model("Exercises", exerciseSchema);
