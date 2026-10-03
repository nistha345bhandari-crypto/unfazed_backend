const SessionNote = require("../models/SessionNote");
const Appointment = require("../models/Appointment");

const {
    canAccess
} = require("../services/entitlementService");

// Create a session note

const createSessionNote = async (req, res) => {
    try {
        const therapistId = req.user.id;

        const {
            noteType
        } = req.body;

        const requestedNoteType =
            noteType || "general";

        const normalizedNoteType =
            requestedNoteType.toLowerCase();

        let featureKey =
            "note_template_basic";

        if (
            normalizedNoteType === "soap" ||
            normalizedNoteType === "dap" ||
            normalizedNoteType === "advanced"
        ) {
            featureKey =
                "note_template_advanced";
        }

        const allowed =
            await canAccess(
                therapistId,
                featureKey
            );

        if (!allowed) {
            return res.status(403).json({
                message:
                    "This note template is not available in your current subscription",
                featureKey,
                upgradeRequired: true
            });
        }

        const {
            patientId,
            appointmentId,
            title,
            content,
            visibility,
            subjective,
            objective,
            assessment,
            plan
        } = req.body;

        if (
            !patientId ||
            !appointmentId ||
            !content
        ) {
            return res.status(400).json({
                message:
                    "patientId, appointmentId and content are required"
            });
        }

        // Make sure the appointment belongs to this therapist

        const appointment =
            await Appointment.findOne({
                _id: appointmentId,
                therapist: therapistId,
                patientEmail: {
                    $exists: true
                }
            });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure the patient matches the appointment

        const Patient =
            require("../models/Patient");

        const patient =
            await Patient.findById(
                patientId
            );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        if (
            patient.email.toLowerCase() !==
            appointment.patientEmail.toLowerCase()
        ) {
            return res.status(403).json({
                message:
                    "This appointment does not belong to this patient"
            });
        }

        const note =
            await SessionNote.create({
                therapist: therapistId,
                patient: patientId,
                appointment: appointmentId,
                title: title || "",
                content,
                visibility:
                    visibility || "private",
                noteType:
                    noteType || "general",
                subjective:
                    subjective || "",
                objective:
                    objective || "",
                assessment:
                    assessment || "",
                plan:
                    plan || ""
            });

        res.status(201).json({
            message:
                "Session note created successfully",
            note
        });

    } catch (error) {
        console.error(
            "CREATE SESSION NOTE ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create session note"
        });
    }
};


// Get notes for a patient — therapist side

const getPatientSessionNotes = async (
    req,
    res
) => {
    try {
        const therapistId =
            req.user.id;

        const { patientId } =
            req.params;

        const notes =
            await SessionNote.find({
                therapist: therapistId,
                patient: patientId
            })
                .populate("appointment")
                .sort({
                    createdAt: -1
                });

        res.json({
            notes
        });

    } catch (error) {
        console.error(
            "GET SESSION NOTES ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get session notes"
        });
    }
};


// Get a single note — therapist side

const getSessionNote = async (
    req,
    res
) => {
    try {
        const therapistId =
            req.user.id;

        const { id } =
            req.params;

        const note =
            await SessionNote.findOne({
                _id: id,
                therapist: therapistId
            })
                .populate(
                    "patient",
                    "name email"
                )
                .populate("appointment");

        if (!note) {
            return res.status(404).json({
                message:
                    "Session note not found"
            });
        }

        res.json({
            note
        });

    } catch (error) {
        console.error(
            "GET SESSION NOTE ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get session note"
        });
    }
};


// Update a session note

const updateSessionNote = async (
    req,
    res
) => {
    try {
        const therapistId =
            req.user.id;

        const { id } =
            req.params;

        const note =
            await SessionNote.findOne({
                _id: id,
                therapist: therapistId
            });

        if (!note) {
            return res.status(404).json({
                message:
                    "Session note not found"
            });
        }

        const {
            title,
            content,
            visibility,
            noteType,
            subjective,
            objective,
            assessment,
            plan
        } = req.body;


        // Check entitlement if note type is being changed

        if (noteType !== undefined) {
            const requestedNoteType =
                noteType || "general";

            const normalizedNoteType =
                requestedNoteType.toLowerCase();

            let featureKey =
                "note_template_basic";

            if (
                normalizedNoteType === "soap" ||
                normalizedNoteType === "dap" ||
                normalizedNoteType === "advanced"
            ) {
                featureKey =
                    "note_template_advanced";
            }

            const allowed =
                await canAccess(
                    therapistId,
                    featureKey
                );

            if (!allowed) {
                return res.status(403).json({
                    message:
                        "This note template is not available in your current subscription",
                    featureKey,
                    upgradeRequired: true
                });
            }

            note.noteType = noteType;
        }


        if (title !== undefined) {
            note.title = title;
        }

        if (content !== undefined) {
            note.content = content;
        }

        if (visibility !== undefined) {
            note.visibility = visibility;
        }

        if (subjective !== undefined) {
            note.subjective = subjective;
        }

        if (objective !== undefined) {
            note.objective = objective;
        }

        if (assessment !== undefined) {
            note.assessment = assessment;
        }

        if (plan !== undefined) {
            note.plan = plan;
        }

        await note.save();

        res.json({
            message:
                "Session note updated successfully",
            note
        });

    } catch (error) {
        console.error(
            "UPDATE SESSION NOTE ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update session note"
        });
    }
};


// Delete a session note

const deleteSessionNote = async (
    req,
    res
) => {
    try {
        const therapistId =
            req.user.id;

        const { id } =
            req.params;

        const note =
            await SessionNote.findOneAndDelete({
                _id: id,
                therapist: therapistId
            });

        if (!note) {
            return res.status(404).json({
                message:
                    "Session note not found"
            });
        }

        res.json({
            message:
                "Session note deleted successfully"
        });

    } catch (error) {
        console.error(
            "DELETE SESSION NOTE ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete session note"
        });
    }
};


// Get shared session notes for logged-in patient

const getPatientSharedSessionNotes =
    async (req, res) => {
        try {
            const patientId =
                req.user.id;

            const notes =
                await SessionNote.find({
                    patient: patientId,
                    visibility: "shared"
                })
                    .populate(
                        "therapist",
                        "name slug"
                    )
                    .populate("appointment")
                    .sort({
                        createdAt: -1
                    });

            res.json({
                notes
            });

        } catch (error) {
            console.error(
                "GET PATIENT SHARED SESSION NOTES ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to get shared session notes",
                error: error.message
            });
        }
    };


module.exports = {
    createSessionNote,
    getPatientSessionNotes,
    getSessionNote,
    updateSessionNote,
    deleteSessionNote,
    getPatientSharedSessionNotes
};