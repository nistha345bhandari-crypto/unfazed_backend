const PDFDocument = require("pdfkit");

const generateInvoicePDF = (payment, patient, therapist, res) => {
    const doc = new PDFDocument({
        margin: 50
    });

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${payment._id}.pdf`
    );

    doc.pipe(res);

    // =====================================
    // HEADER
    // =====================================

    doc
        .fontSize(24)
        .text("UNFAZED", {
            align: "center"
        });

    doc
        .moveDown(0.5)
        .fontSize(18)
        .text("GST-STYLE INVOICE", {
            align: "center"
        });

    doc.moveDown(2);

    // =====================================
    // INVOICE DETAILS
    // =====================================

    doc
        .fontSize(11)
        .text(`Invoice ID: ${payment._id}`);

    doc.text(
        `Invoice Date: ${new Date(
            payment.purchaseDate
        ).toLocaleDateString()}`
    );

    doc.text(
        `Payment Status: ${payment.paymentStatus}`
    );

    doc.moveDown(1.5);

    // =====================================
    // PATIENT DETAILS
    // =====================================

    doc
        .fontSize(14)
        .text("Bill To");

    doc.moveDown(0.5);

    doc
        .fontSize(11)
        .text(`Patient: ${patient.name}`);

    doc.text(
        `Email: ${patient.email}`
    );

    doc.moveDown(1.5);

    // =====================================
    // THERAPIST DETAILS
    // =====================================

    doc
        .fontSize(14)
        .text("Therapist");

    doc.moveDown(0.5);

    doc
        .fontSize(11)
        .text(`Name: ${therapist.name}`);

    doc.text(
        `Email: ${therapist.email}`
    );

    doc.moveDown(1.5);

    // =====================================
    // PACKAGE DETAILS
    // =====================================

    doc
        .fontSize(14)
        .text("Package Details");

    doc.moveDown(0.5);

    doc
        .fontSize(11)
        .text(
            `Package: ${payment.packageType}-Session Package`
        );

    doc.text(
        `Sessions Purchased: ${payment.sessionsPurchased}`
    );

    doc.text(
        `Sessions Remaining: ${payment.sessionsRemaining}`
    );

    doc.text(
        `Valid Until: ${new Date(
            payment.expiryDate
        ).toLocaleDateString()}`
    );

    doc.moveDown(1.5);

    // =====================================
    // PAYMENT DETAILS
    // =====================================

    doc
        .fontSize(14)
        .text("Payment Details");

    doc.moveDown(0.5);

    doc
        .fontSize(11)
        .text(
            `Amount: ₹${payment.amount}`
        );

    doc.text(
        `Currency: ${payment.currency}`
    );

    doc.text(
        `Razorpay Order ID: ${
            payment.razorpayOrderId || "N/A"
        }`
    );

    doc.text(
        `Razorpay Payment ID: ${
            payment.razorpayPaymentId || "N/A"
        }`
    );

    doc.moveDown(1.5);

    // =====================================
    // TAX INFORMATION
    // =====================================

    const gstRate = 18;

    const baseAmount =
        payment.amount /
        (1 + gstRate / 100);

    const gstAmount =
        payment.amount - baseAmount;

    doc
        .fontSize(14)
        .text("Tax Summary");

    doc.moveDown(0.5);

    doc
        .fontSize(11)
        .text(
            `Taxable Amount: ₹${baseAmount.toFixed(2)}`
        );

    doc.text(
        `GST (${gstRate}%): ₹${gstAmount.toFixed(2)}`
    );

    doc.text(
        `Total Amount: ₹${payment.amount.toFixed(2)}`
    );

    doc.moveDown(2);

    // =====================================
    // FOOTER
    // =====================================

    doc
        .fontSize(10)
        .text(
            "This is a computer-generated invoice.",
            {
                align: "center"
            }
        );

    doc.text(
        "Thank you for using Unfazed.",
        {
            align: "center"
        }
    );

    doc.end();
};

module.exports = generateInvoicePDF;