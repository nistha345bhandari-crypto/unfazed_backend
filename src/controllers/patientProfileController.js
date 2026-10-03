const PatientProfile = require("../models/PatientProfile");

// ==========================================
// GET PATIENT PROFILE
// ==========================================

const getPatientProfile = async (req, res) => {
    try {
        let profile = await PatientProfile.findOne({
            patient: req.user.id
        });

        // Create profile if it does not exist
        if (!profile) {
            profile = await PatientProfile.create({
                patient: req.user.id
            });
        }

        res.status(200).json({
            profile
        });

    } catch (error) {
        console.error(
            "GET PATIENT PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// UPDATE PATIENT PROFILE
// ==========================================

const updatePatientProfile = async (req, res) => {
    try {
        const {
            phone,
            dateOfBirth,
            gender,
            emergencyContactName,
            emergencyContactPhone,
            address,

            // Intake
            presentingConcern,
            history,

            // Consent
            consentGiven
        } = req.body;


        let profile = await PatientProfile.findOne({
            patient: req.user.id
        });


        // Create profile if it does not exist
        if (!profile) {
            profile = new PatientProfile({
                patient: req.user.id
            });
        }


        // =========================
        // BASIC INFORMATION
        // =========================

        if (phone !== undefined) {
            profile.phone = phone;
        }

        if (dateOfBirth !== undefined) {
            profile.dateOfBirth = dateOfBirth;
        }

        if (gender !== undefined) {
            profile.gender = gender;
        }

        if (address !== undefined) {
            profile.address = address;
        }


        // =========================
        // EMERGENCY CONTACT
        // =========================

        if (emergencyContactName !== undefined) {
            profile.emergencyContactName =
                emergencyContactName;
        }

        if (emergencyContactPhone !== undefined) {
            profile.emergencyContactPhone =
                emergencyContactPhone;
        }


        // =========================
        // INTAKE INFORMATION
        // =========================

        if (presentingConcern !== undefined) {
            profile.presentingConcern =
                presentingConcern;
        }

        if (history !== undefined) {
            profile.history = history;
        }


        // =========================
        // CONSENT
        // =========================

        if (consentGiven !== undefined) {

            profile.consentGiven = consentGiven;

            // Store timestamp when consent is given
            if (
                consentGiven === true &&
                !profile.consentTimestamp
            ) {
                profile.consentTimestamp = new Date();
            }

            // Remove timestamp if consent is withdrawn
            if (consentGiven === false) {
                profile.consentTimestamp = null;
            }
        }


        await profile.save();


        res.status(200).json({
            message: "Patient profile updated successfully",
            profile
        });

    } catch (error) {
        console.error(
            "UPDATE PATIENT PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getPatientProfile,
    updatePatientProfile
};