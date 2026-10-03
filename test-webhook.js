require("dotenv").config();

const crypto = require("crypto");
const https = require("https");

const payload =
    '{"event":"payment.captured","payload":{"payment":{"entity":{"order_id":"order_TeVYnBrJYXYt45","id":"pay_TeVmju6B6AHk2"}}}}';

const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

console.log("SIGNATURE:", signature);

const options = {
    hostname: "stylist-expansive-couch.ngrok-free.dev",
    path: "/api/payments/webhook",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
        "Content-Length": Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        console.log("STATUS:", res.statusCode);
        console.log("RESPONSE:", data);
    });
});

req.on("error", (error) => {
    console.error("REQUEST ERROR:", error);
});

req.write(payload);
req.end();