const Appointment = require("../models/Appointment");
const Therapist = require("../models/Therapist");
const Patient = require("../models/Patient");
const PatientProfile = require("../models/PatientProfile");
const Availability = require("../models/Availability");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");

const {
    canAccess,
    getClientLimit
} = require("../services/entitlementService");


// ==========================================
// PATIENT - CREATE APPOINTMENT
// ==========================================

const createAppointment = async (req, res) => {
    try {
        const {
            availabilityId,
            paymentId,
            message
        } = req.body;

        if (!availabilityId) {
            return res.status(400).json({
                message: "Availability ID is required"
            });
        }

        if (!paymentId) {
            return res.status(400).json({
                message: "Payment ID is required"
            });
        }

        const patient = await Patient.findById(
            req.user.id
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const availability =
            await Availability.findById(
                availabilityId
            );

        console.log(
            "BOOKING AVAILABILITY:",
            availability
        );

        if (!availability) {
            return res.status(404).json({
                message: "Availability slot not found"
            });
        }

        if (availability.isBooked) {
            return res.status(400).json({
                message:
                    "This time slot is already booked"
            });
        }

        // ==========================================
        // FIND PATIENT PAYMENT PACKAGE
        // ==========================================

        const payment = await Payment.findOne({
            _id: paymentId,
            patient: req.user.id
        });

        if (!payment) {
            return res.status(404).json({
                message:
                    "Payment package not found"
            });
        }

        // ==========================================
        // CHECK PAYMENT BELONGS TO SAME THERAPIST
        // ==========================================

        if (
            payment.therapist.toString() !==
            availability.therapist.toString()
        ) {
            return res.status(400).json({
                message:
                    "Payment package does not belong to this therapist"
            });
        }

        // ==========================================
        // CHECK PAYMENT STATUS
        // ==========================================

        if (payment.paymentStatus !== "paid") {
            return res.status(400).json({
                message:
                    "Payment package is not active"
            });
        }

        // ==========================================
        // CHECK REMAINING SESSIONS
        // ==========================================

        if (payment.sessionsRemaining <= 0) {
            return res.status(400).json({
                message:
                    "No sessions remaining in this package"
            });
        }

        // ==========================================
        // CHECK EXPIRY
        // ==========================================

        if (
            new Date(payment.expiryDate) <
            new Date()
        ) {
            return res.status(400).json({
                message:
                    "Payment package has expired"
            });
        }

        // ==========================================
        // CHECK ACTIVE CLIENT LIMIT
        // ==========================================

        const clientLimitAccess =
            await canAccess(
                availability.therapist,
                "active_client_cap"
            );

        if (!clientLimitAccess) {
            return res.status(403).json({
                message:
                    "Your subscription does not include active client management",
                featureKey:
                    "active_client_cap",
                upgradeRequired: true
            });
        }

        const clientLimit =
            await getClientLimit(
                availability.therapist
            );

        // Get existing active clients
        const existingClientResult =
            await Appointment.aggregate([
                {
                    $match: {
                        therapist:
                            availability.therapist,
                        status: {
                            $nin: [
                                "cancelled",
                                "rejected"
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id:
                            "$patientEmail"
                    }
                }
            ]);

        const existingClientEmails =
            existingClientResult.map(
                (client) =>
                    client._id
            );

        // Check if patient is already a client
        const isExistingClient =
            existingClientEmails.includes(
                patient.email
            );

        // Only apply limit to new clients
        if (
            !isExistingClient &&
            existingClientEmails.length >=
                clientLimit
        ) {
            return res.status(403).json({
                message:
                    "Active client limit reached for your subscription",
                clientLimit,
                currentClients:
                    existingClientEmails.length,
                featureKey:
                    "active_client_cap",
                upgradeRequired: true
            });
        }

        // ==========================================
        // CREATE APPOINTMENT
        // ==========================================

        const appointment =
            await Appointment.create({
                therapist:
                    availability.therapist,
                patientName:
                    patient.name,
                patientEmail:
                    patient.email,
                date:
                    availability.date,
                startTime:
                    availability.startTime,
                endTime:
                    availability.endTime,
                availability:
                    availability._id,
                payment:
                    payment._id,
                message
            });

        // ==========================================
        // MARK AVAILABILITY AS BOOKED
        // ==========================================

        availability.isBooked = true;

        await availability.save();

        // ==========================================
        // DEDUCT ONE SESSION
        // ==========================================

        payment.sessionsRemaining -= 1;

        await payment.save();

        // ==========================================
        // CREATE NOTIFICATION
        // ==========================================

        await Notification.create({
            recipient:
                availability.therapist,
            recipientModel:
                "Therapist",
            type:
                "appointment_request",
            title:
                "New Appointment Request",
            message:
                `${patient.name} has requested an appointment with you.`
        });

        res.status(201).json({
            message:
                "Appointment created successfully",
            appointment
        });

    } catch (error) {
        console.error(
            "CREATE APPOINTMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - GET APPOINTMENTS
// ==========================================

const getTherapistAppointments = async (
    req,
    res
) => {
    try {
        const appointments =
            await Appointment.find({
                therapist: req.user.id
            }).sort({
                date: 1
            });

        res.status(200).json({
            appointments
        });

    } catch (error) {
        console.error(
            "GET THERAPIST APPOINTMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - UPDATE APPOINTMENT STATUS
// ==========================================

const updateAppointmentStatus = async (
    req,
    res
) => {
    try {
        const { status } = req.body;

        if (
            ![
                "accepted",
                "rejected",
                "completed"
            ].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const appointment =
            await Appointment.findOne({
                _id: req.params.id,
                therapist: req.user.id
            });

        if (!appointment) {
            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }

        const allowedTransitions = {
            pending: [
                "accepted",
                "rejected"
            ],
            accepted: [
                "completed"
            ],
            rejected: [],
            completed: [],
            cancelled: []
        };

        if (
            !allowedTransitions[
                appointment.status
            ].includes(status)
        ) {
            return res.status(400).json({
                message:
                    `Cannot change appointment status from ${appointment.status} to ${status}`
            });
        }

        appointment.status = status;

        await appointment.save();

        // CREATE NOTIFICATION FOR PATIENT
        if (status === "accepted") {
            const patient =
                await Patient.findOne({
                    email:
                        appointment.patientEmail
                });

            console.log(
                "PATIENT FOR NOTIFICATION:",
                patient
            );

            if (patient) {
                await Notification.create({
                    recipient:
                        patient._id,
                    recipientModel:
                        "Patient",
                    type:
                        "appointment_accepted",
                    title:
                        "Appointment Accepted",
                    message:
                        "Your appointment has been accepted."
                });
            }
        }

        res.status(200).json({
            message:
                `Appointment ${status} successfully`,
            appointment
        });

    } catch (error) {
        console.error(
            "UPDATE APPOINTMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// PATIENT - GET ALL APPOINTMENTS
// ==========================================

const getPatientAppointments = async (
    req,
    res
) => {
    try {
        const patient =
            await Patient.findById(
                req.user.id
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Patient not found"
            });
        }

        const appointments =
            await Appointment.find({
                patientEmail:
                    patient.email
            })
                .populate(
                    "therapist",
                    "name slug bio specializations languages"
                )
                .sort({
                    date: -1
                });

        res.status(200).json({
            appointments
        });

    } catch (error) {
        console.error(
            "GET PATIENT APPOINTMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - GET ONE APPOINTMENT
// ==========================================

const getAppointmentById = async (
    req,
    res
) => {
    try {
        const appointment =
            await Appointment.findOne({
                _id: req.params.id,
                therapist: req.user.id
            });

        if (!appointment) {
            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }

        res.status(200).json({
            appointment
        });

    } catch (error) {
        console.error(
            "GET APPOINTMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// PATIENT - GET ONE APPOINTMENT
// ==========================================

const getPatientAppointmentById = async (
    req,
    res
) => {
    try {
        console.log(
            "PATIENT USER:",
            req.user
        );

        console.log(
            "APPOINTMENT ID:",
            req.params.id
        );

        const patient =
            await Patient.findById(
                req.user.id
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Patient not found"
            });
        }

        const appointment =
            await Appointment.findById(
                req.params.id
            ).populate(
                "therapist",
                "name slug bio specializations languages"
            );

        if (!appointment) {
            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }

        if (
            appointment.patientEmail !==
            patient.email
        ) {
            return res.status(403).json({
                message:
                    "You are not allowed to view this appointment"
            });
        }

        res.status(200).json({
            appointment
        });

    } catch (error) {
        console.error(
            "GET PATIENT APPOINTMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// PATIENT - CANCEL APPOINTMENT
// ==========================================

const cancelPatientAppointment = async (
    req,
    res
) => {
    try {
        const patient =
            await Patient.findById(
                req.user.id
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Patient not found"
            });
        }

        const appointment =
            await Appointment.findOne({
                _id: req.params.id,
                patientEmail:
                    patient.email
            });

        if (!appointment) {
            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }

        if (
            appointment.status ===
            "cancelled"
        ) {
            return res.status(400).json({
                message:
                    "Appointment is already cancelled"
            });
        }

        appointment.status =
            "cancelled";

        await appointment.save();

        // Make availability available again
        if (appointment.availability) {
            await Availability.findByIdAndUpdate(
                appointment.availability,
                {
                    isBooked: false
                }
            );
        }

        res.status(200).json({
            message:
                "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error(
            "CANCEL APPOINTMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - GET CLIENTS
// ==========================================

const getTherapistClients = async (
    req,
    res
) => {
    try {
        const appointments =
            await Appointment.find({
                therapist: req.user.id
            });

        const patientEmails = [
            ...new Set(
                appointments.map(
                    (appointment) =>
                        appointment.patientEmail
                )
            )
        ];

        const patients =
            await Patient.find({
                email: {
                    $in: patientEmails
                }
            }).select(
                "name email"
            );

        const clients =
            await Promise.all(
                patients.map(
                    async (patient) => {
                        const profile =
                            await PatientProfile.findOne({
                                patient:
                                    patient._id
                            });

                        return {
                            id:
                                patient._id,
                            name:
                                patient.name,
                            email:
                                patient.email,
                            profile
                        };
                    }
                )
            );

        res.status(200).json({
            clients
        });

    } catch (error) {
        console.error(
            "GET THERAPIST CLIENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - GET ONE CLIENT
// ==========================================

const getTherapistClientById = async (
    req,
    res
) => {
    try {
        const patient =
            await Patient.findById(
                req.params.id
            ).select(
                "name email"
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Client not found"
            });
        }

        const appointment =
            await Appointment.findOne({
                therapist: req.user.id,
                patientEmail:
                    patient.email
            });

        if (!appointment) {
            return res.status(403).json({
                message:
                    "Client does not belong to this therapist"
            });
        }

        const profile =
            await PatientProfile.findOne({
                patient:
                    patient._id
            });

        res.status(200).json({
            client: {
                id:
                    patient._id,
                name:
                    patient.name,
                email:
                    patient.email,
                profile
            }
        });

    } catch (error) {
        console.error(
            "GET THERAPIST CLIENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// THERAPIST - GET CLIENT APPOINTMENTS
// ==========================================

const getTherapistClientAppointments = async (
    req,
    res
) => {
    try {
        const patient =
            await Patient.findById(
                req.params.id
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Client not found"
            });
        }

        const appointments =
            await Appointment.find({
                therapist: req.user.id,
                patientEmail:
                    patient.email
            }).sort({
                date: -1
            });

        res.status(200).json({
            appointments
        });

    } catch (error) {
        console.error(
            "GET CLIENT APPOINTMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    createAppointment,
    getTherapistAppointments,
    updateAppointmentStatus,
    getPatientAppointments,
    getAppointmentById,
    getPatientAppointmentById,
    cancelPatientAppointment,
    getTherapistClients,
    getTherapistClientById,
    getTherapistClientAppointments
};