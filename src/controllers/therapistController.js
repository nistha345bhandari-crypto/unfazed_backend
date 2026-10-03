const Therapist = require("../models/Therapist");

const getTherapistProfile = async (req, res) => {
    try {
        const therapist = await Therapist.findById(req.user.id)
            .select("-password_hash");

        if (!therapist) {
            return res.status(404).json({
                message: "Therapist not found"
            });
        }

        res.status(200).json({
            therapist
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const updateTherapistProfile = async (req, res) => {
    try {
        const { bio, specializations, languages } = req.body;

        const therapist = await Therapist.findByIdAndUpdate(
            req.user.id,
            {
                bio,
                specializations,
                languages
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password_hash");

        if (!therapist) {
            return res.status(404).json({
                message: "Therapist not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            therapist
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getPublicTherapist = async (req, res) => {
    try {
        console.log("PUBLIC PROFILE SLUG:", req.params.slug);
        const therapist = await Therapist.findOne({
            slug: req.params.slug
        }).select(
            "-password_hash -email"
        );

        if (!therapist) {
            return res.status(404).json({
                message: "Therapist not found"
            });
        }
        console.log("THERAPIST FOUND:", therapist.name);
        res.status(200).json({
            therapist
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getAllTherapists = async (req, res) => {
    try {
        const therapists = await Therapist.find()
            .select(
                "name email slug bio specializations languages"
            )
            .sort({ name: 1 });

        res.json({
            therapists
        });

    } catch (error) {
        console.error(
            "GET ALL THERAPISTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch therapists"
        });
    }
};
module.exports = {
    getTherapistProfile,
    updateTherapistProfile,
    getPublicTherapist,
    getAllTherapists
};