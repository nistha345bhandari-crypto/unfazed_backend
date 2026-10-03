const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Therapist = require("../models/Therapist");
const Patient = require("../models/Patient");


// ===============================
// REGISTER THERAPIST
// ===============================

const registerTherapist = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingTherapist = await Therapist.findOne({ email });

        if (existingTherapist) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const therapist = await Therapist.create({
            name,
            email,
            password_hash,
            slug: name.toLowerCase().replace(/\s+/g, "-")
        });

        const token = jwt.sign(
            {
                id: therapist._id,
                email: therapist.email,
                role: "therapist"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(201).json({
            message: "Therapist registered successfully",
            token,
            therapist: {
                id: therapist._id,
                name: therapist.name,
                email: therapist.email,
                slug: therapist.slug
            }
        });

    } catch (error) {
        console.error("THERAPIST REGISTER ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// LOGIN THERAPIST
// ===============================

const loginTherapist = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const therapist = await Therapist.findOne({ email });

        if (!therapist) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            therapist.password_hash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: therapist._id,
                email: therapist.email,
                role: "therapist"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            therapist: {
                id: therapist._id,
                name: therapist.name,
                email: therapist.email,
                slug: therapist.slug
            }
        });

    } catch (error) {
        console.error("THERAPIST LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// REGISTER PATIENT
// ===============================

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
                email: patient.email,
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


// ===============================
// LOGIN PATIENT
// ===============================

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

        const isPasswordCorrect = await bcrypt.compare(
            password,
            patient.password_hash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: patient._id,
                email: patient.email,
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


module.exports = {
    registerTherapist,
    loginTherapist,
    registerPatient,
    loginPatient
};