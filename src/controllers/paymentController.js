const Payment = require("../models/Payment");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const generateInvoicePDF = require("../utils/invoiceGenerator");
// ==========================================
// CREATE PAYMENT RECORD
// ==========================================

const createPayment = async (req, res) => {
    try {
        const {
            therapistId,
            packageType,
            amount,
            expiryDate
        } = req.body;

        // Validate required fields
        if (
            !therapistId ||
            !packageType ||
            !amount ||
            !expiryDate
        ) {
            return res.status(400).json({
                message:
                    "Therapist, package type, amount and expiry date are required"
            });
        }

const packageMap = {
    "3": {
        sessions: 3,
        amount: 1500
    },
    "6": {
        sessions: 6,
        amount: 2800
    },
    "12": {
        sessions: 12,
        amount: 5000
    }
};

const selectedPackage = packageMap[packageType];

if (!selectedPackage) {
    return res.status(400).json({
        message: "Invalid package type"
    });
}

if (Number(amount) !== selectedPackage.amount) {
    return res.status(400).json({
        message: `Invalid amount for ${packageType}-session package`
    });
}

const sessionsPurchased = selectedPackage.sessions;       

        const payment = await Payment.create({
            patient: req.user.id,
            therapist: therapistId,
            packageType,
            sessionsPurchased,
            sessionsRemaining: sessionsPurchased,
            amount,
            expiryDate,
            paymentStatus: "pending"
        });

        res.status(201).json({
            message: "Payment record created successfully",
            payment
        });

    } catch (error) {
        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET PATIENT PAYMENT HISTORY
// ==========================================

const getPatientPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            patient: req.user.id
        })
            .populate(
                "therapist",
                "name slug"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            payments
        });

    } catch (error) {
        console.error(
            "GET PATIENT PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET THERAPIST PAYMENT HISTORY
// ==========================================

const getTherapistPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            therapist: req.user.id
        })
            .populate(
                "patient",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            payments
        });

    } catch (error) {
        console.error(
            "GET THERAPIST PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};
const createRazorpayOrder = async (req, res) => {
    try {
        const {
            therapistId,
            packageType,
            amount,
            expiryDate
        } = req.body;

        if (!therapistId || !packageType || !amount || !expiryDate) {
            return res.status(400).json({
                message: "Therapist, package type, amount and expiry date are required"
            });
        }

        const packageMap = {
            "3": {
                sessions: 3,
                amount: 1500
            },
            "6": {
                sessions: 6,
                amount: 2800
            },
            "12": {
                sessions: 12,
                amount: 5000
            }
        };

        const selectedPackage = packageMap[packageType];

        if (!selectedPackage) {
            return res.status(400).json({
                message: "Invalid package type"
            });
        }

        if (Number(amount) !== selectedPackage.amount) {
            return res.status(400).json({
                message: `Invalid amount for ${packageType}-session package`
            });
        }

        const sessionsPurchased = selectedPackage.sessions;

        // Create Razorpay order
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save payment record in MongoDB
        const payment = await Payment.create({
            patient: req.user.id,
            therapist: therapistId,
            packageType,
            sessionsPurchased,
            sessionsRemaining: sessionsPurchased,
            amount,
            expiryDate,
            razorpayOrderId: order.id,
            paymentStatus: "pending"
        });

        res.status(201).json({
            message: "Razorpay order created successfully",
            order,
            payment
        });

    } catch (error) {
        console.error("RAZORPAY ORDER ERROR:", error);

        res.status(500).json({
            message: "Failed to create Razorpay order"
        });
    }
};
const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment verification details are required"
            });
        }

        // Create signature using Razorpay secret
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        // Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        // Find the payment belonging to this patient
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            patient: req.user.id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment record not found"
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = "paid";

        await payment.save();

        res.status(200).json({
            message: "Payment verified successfully",
            payment
        });

    } catch (error) {
        console.error("VERIFY PAYMENT ERROR:", error);

        res.status(500).json({
            message: "Payment verification failed"
        });
    }
};
const getActivePatientPackages = async (req, res) => {
    try {
        const payments = await Payment.find({
            patient: req.user.id,
            paymentStatus: "paid",
            sessionsRemaining: { $gt: 0 },
            expiryDate: { $gte: new Date() }
        })
            .populate("therapist", "name slug")
            .sort({ expiryDate: 1 });

        res.status(200).json({
            packages: payments
        });

    } catch (error) {
        console.error("GET ACTIVE PACKAGES ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// ==========================================
// RAZORPAY WEBHOOK
// ==========================================

const razorpayWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers["x-razorpay-signature"];

        if (!webhookSignature) {
            return res.status(400).json({
                message: "Webhook signature missing"
            });
        }

    const generatedSignature = crypto
    .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
    )
    .update(req.body)
    .digest("hex");        

    
console.log("WEBHOOK SIGNATURE RECEIVED:", !!webhookSignature);
console.log("WEBHOOK BODY IS BUFFER:", Buffer.isBuffer(req.body));
console.log("WEBHOOK BODY LENGTH:", req.body.length);
console.log(
    "WEBHOOK SIGNATURE VALID:",
    generatedSignature === webhookSignature
);
console.log("EXPECTED SIGNATURE:", generatedSignature);
console.log("RECEIVED SIGNATURE:", webhookSignature);
if (generatedSignature !== webhookSignature) {
    return res.status(400).json({
        message: "Invalid webhook signature"
    });
}
const payload = JSON.parse(req.body.toString("utf8"));
const event = payload.event;

        console.log("RAZORPAY WEBHOOK EVENT:", event);

        // Payment captured successfully
        if (event === "payment.captured") {
            const paymentEntity =
                payload.payload.payment.entity;

            const razorpayOrderId =
                paymentEntity.order_id;

            const razorpayPaymentId =
                paymentEntity.id;

            const payment = await Payment.findOne({
                razorpayOrderId
            });

            if (payment) {
                payment.razorpayPaymentId =
                    razorpayPaymentId;

                payment.paymentStatus = "paid";

                await payment.save();

                console.log(
                    "PAYMENT MARKED AS PAID:",
                    payment._id
                );
            }
        }

        // Payment failed
        if (event === "payment.failed") {
            const paymentEntity =
                req.body.payload.payment.entity;

            const razorpayOrderId =
                paymentEntity.order_id;

            const payment = await Payment.findOne({
                razorpayOrderId
            });

            if (payment) {
                payment.paymentStatus = "failed";

                await payment.save();

                console.log(
                    "PAYMENT MARKED AS FAILED:",
                    payment._id
                );
            }
        }

        res.status(200).json({
            message: "Webhook received successfully"
        });

    } catch (error) {
        console.error(
            "RAZORPAY WEBHOOK ERROR:",
            error
        );

        res.status(500).json({
            message: "Webhook processing failed"
        });
    }
};
const downloadInvoice = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;

        const payment = await Payment.findById(
            paymentId
        )
            .populate(
                "patient",
                "name email"
            )
            .populate(
                "therapist",
                "name email"
            );

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // Make sure the logged-in patient
        // owns this payment
        if (
            payment.patient._id.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Invoice should only be generated
        // for successful payments
        if (payment.paymentStatus !== "paid") {
            return res.status(400).json({
                message:
                    "Invoice is available only for paid payments"
            });
        }

        generateInvoicePDF(
            payment,
            payment.patient,
            payment.therapist,
            res
        );

    } catch (error) {
        console.error(
            "DOWNLOAD INVOICE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to generate invoice"
        });
    }
};
module.exports = {
    createPayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPatientPayments,
    getTherapistPayments,
    getActivePatientPackages,
    razorpayWebhook,
    downloadInvoice

};