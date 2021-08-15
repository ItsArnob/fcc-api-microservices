const { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

const urlSchema = new Schema({
    _id: {
        type: String,
        default: () => nanoid(6)
    },
    original_url: {
        type: String,
        required: true
    }
});
const shortUrlModel = model("shortenedUrl", urlSchema, "shortened_urls");

module.exports = shortUrlModel;