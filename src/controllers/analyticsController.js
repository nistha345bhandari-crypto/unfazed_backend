const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");

// ======================================
// DASHBOARD ANALYTICS
// ======================================

const getAnalytics = async (req, res) => {
    try {
        const therapistId = new mongoose.Types.ObjectId(
            req.user.id
        );

        // ==========================
        // TOTAL REVENUE
        // ==========================

        const revenueResult =
            await Payment.aggregate([
                {
                    $match: {
                        therapist: therapistId,
                        paymentStatus: "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

        const totalRevenue =
            revenueResult[0]?.totalRevenue || 0;

        // ==========================
        // TOTAL CLIENTS
        // ==========================

        const clientResult =
            await Appointment.aggregate([
                {
                    $match: {
                        therapist: therapistId
                    }
                },
                {
                    $group: {
                        _id: "$patientEmail"
                    }
                }
            ]);

        const totalClients =
            clientResult.length;

        // ==========================
        // TOTAL APPOINTMENTS
        // ==========================

        const totalAppointments =
            await Appointment.countDocuments({
                therapist: therapistId
            });

        // ==========================
        // COMPLETED APPOINTMENTS
        // ==========================

        const completedAppointments =
            await Appointment.countDocuments({
                therapist: therapistId,
                status: "completed"
            });

        // ==========================
        // CANCELLED APPOINTMENTS
        // ==========================

        const cancelledAppointments =
            await Appointment.countDocuments({
                therapist: therapistId,
                status: "cancelled"
            });

        // ==========================
        // NO SHOW RATE
        // ==========================

        const noShowRate =
            totalAppointments === 0
                ? 0
                : (
                      (cancelledAppointments /
                          totalAppointments) *
                      100
                  ).toFixed(1);

        // ==========================
        // MONTHLY REVENUE
        // ==========================

        const monthlyRevenue =
            await Payment.aggregate([
                {
                    $match: {
                        therapist: therapistId,
                        paymentStatus: "paid"
                    }
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$createdAt"
                            }
                        },
                        revenue: {
                            $sum: "$amount"
                        }
                    }
                },
                {
                    $sort: {
                        "_id.month": 1
                    }
                }
            ]);

        res.json({
            totalRevenue,
            totalClients,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            noShowRate,
            monthlyRevenue
        });

    } catch (error) {
        console.error(
            "ANALYTICS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load analytics"
        });
    }
};

module.exports = {
    getAnalytics
};