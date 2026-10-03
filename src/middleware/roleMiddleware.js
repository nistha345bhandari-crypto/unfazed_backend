const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        console.log("USER ROLE:", req.user.role);
        console.log("REQUIRED ROLE:", requiredRole);

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;