const mongoose = require("mongoose");
//mongoose.Schema-This defines what a Therapist document should look like in MongoDB.
const therapistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password_hash: {
            type: String,
            required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        bio: {
            type: String,
            default: ""
        },

        specializations: {
            type: [String],
            default: []
        },

        languages: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Therapist = mongoose.model("Therapist", therapistSchema);

module.exports = Therapist;