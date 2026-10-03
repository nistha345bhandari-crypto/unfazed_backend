const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");


// ==========================================
// REGISTER PATIENT
// ==========================================

const registerPatient = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const patient = await Patient.create({
            name,
            email,
            password_hash
        });

        const token = jwt.sign(
            {
                id: patient._id,
                role: "patient"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(201).json({
            message: "Patient registered successfully",
            token,
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email
            }
        });

    } catch (error) {
        console.error("PATIENT REGISTER ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// LOGIN PATIENT
// ==========================================

const loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const patient = await Patient.findOne({ email });

        if (!patient) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            patient.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: patient._id,
                role: "patient"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email
            }
        });

    } catch (error) {
        console.error("PATIENT LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    registerPatient,
    loginPatient
};