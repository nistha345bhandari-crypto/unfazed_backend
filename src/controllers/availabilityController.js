const Availability = require("../models/Availability");

// THERAPIST - ADD AVAILABILITY
const addAvailability = async (req, res) => {
    try {
        const {
            date,
            startTime,
            endTime
        } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Date, start time and end time are required"
            });
        }

        const availability = await Availability.create({
            therapist: req.user.id,
            date,
            startTime,
            endTime
        });

        res.status(201).json({
            message: "Availability added successfully",
            availability
        });

    } catch (error) {
        console.error("ADD AVAILABILITY ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// PUBLIC - GET THERAPIST AVAILABILITY
const getTherapistAvailability = async (req, res) => {
    console.log("🔥 GET THERAPIST AVAILABILITY CONTROLLER HIT");

    try {
        const { therapistId } = req.params;

        const availability = await Availability.find({
            therapist: therapistId,
            isBooked: false,
            date: { $gte: new Date() }
        }).sort({
            date: 1,
            startTime: 1
        });

        res.status(200).json({
            availability
        });

    } catch (error) {
        console.error("GET AVAILABILITY ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// THERAPIST - DELETE AVAILABILITY
const deleteAvailability = async (req, res) => {
    try {
        const availability = await Availability.findOne({
            _id: req.params.id,
            therapist: req.user.id
        });

        if (!availability) {
            return res.status(404).json({
                message: "Availability slot not found"
            });
        }

        if (availability.isBooked) {
            return res.status(400).json({
                message: "Cannot delete a booked availability slot"
            });
        }

        await Availability.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Availability deleted successfully"
        });

    } catch (error) {
        console.error("DELETE AVAILABILITY ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    addAvailability,
    getTherapistAvailability,
     deleteAvailability
};