require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Fixed import
const User = require('./models/user'); // Ensure the model exists

const app = express();
app.use(cors({ origin: "http://localhost:3001" })); 
app.use(express.json()); // Middleware to parse JSON

const PORT = process.env.PORT || 3000;

// Root Route
app.get("/", (req, res) => {
    res.send("<h2 align=center>Welcome to the Server</h2>");
});

// User Registration Route
app.post('/register', async (req, res) => {
    console.log("Received Data:", req.body); // Debugging Log

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log("Missing fields:", req.body);
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        console.log("User Registered Successfully");
        res.json({ message: "User Registered Successfully" });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// User Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        res.json({ message: "Login Successful", username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// ✅ Connect to MongoDB using .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected successfully..."))
    .catch(err => console.error("DB connection error:", err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

