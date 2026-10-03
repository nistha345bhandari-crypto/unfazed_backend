const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    console.log("🔵 AUTH MIDDLEWARE HIT");

    try {
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader ? "PRESENT" : "MISSING");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ NO TOKEN");

            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("🔑 TOKEN RECEIVED");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ TOKEN VERIFIED");
        console.log("ROLE:", decoded.role);

        req.user = decoded;

        console.log("➡️ MOVING TO NEXT MIDDLEWARE");

        next();

    } catch (error) {
        console.error("❌ AUTH ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;