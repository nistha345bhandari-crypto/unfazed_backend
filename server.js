//loads our .env variables.
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
//gets the port from .env
const PORT = process.env.PORT || 5000;
//starts the MongoDB connection
connectDB();

app.listen(PORT, () => {
    console.log(`Unfazed server running on port ${PORT}`);
});