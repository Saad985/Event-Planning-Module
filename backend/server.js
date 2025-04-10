const express = require('express');
const serverless = require('serverless-http');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());


module.exports.handler = serverless(app);


// CORS Configuration
const corsOptions = {
    origin: "https://event-planning-module-frontend3-muhammad-saad-amjads-projects.vercel.app", // Vercel frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies if needed
};

app.use(cors(corsOptions));


// Ensure the uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "eventmanagement"
});

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const generateToken = (userId) => {
    const secretKey = '12345'; // Replace this with an actual secret key
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Signup Route
app.post('/signup', upload.single('image'), (req, res) => {
    const checkEmailSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailSql, [req.body.email], (err, result) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).json({ Error: "Error checking email" });
        }
        if (result.length > 0) {
            return res.status(400).json({ Error: "Email already exists" });
        }

        const sql = "INSERT INTO users(`firstName`, `lastName`, `email`, `password`, `profileImage`,`role`) VALUES (?, ?, ?, ?, ?,?)";
        const values = [
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.password, // Store plain text password directly
            req.file ? req.file.filename : null,
            req.body.role,
        ];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting data into database:", err);
                return res.status(500).json({ Error: "Inserting data error in server" });
            }
            return res.json({ Status: "Success" });
        });
    });
});

// Login Route
app.post('/', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Error retrieving user:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid User" });
        }

        const user = results[0];
        // Check password match (assuming plaintext comparison)
        if (user.password !== password) {
            return res.status(400).json({ error: "Invalid Password" });
        }

        // Generate token and send role
        const token = generateToken(user.id); // Your token generation logic
        // Successful login
        return res.json({
            token,
            user: {
                email: user.email,
                role: user.role // Send role from the database
            },
            message: "Login successful" // Include success message
        });
    });
});



// Sending Email to User 
const sendResetPasswordEmail = (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'enter-your-email-here',
            pass: 'enter-your-password-here'
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You are receiving this email because you has requested the reset of the password for your account.</p>
           <p>Please click on the following link, or paste this into your browser to complete the process:</p>
           <p><a href="http://localhost:5173/reset-password/${token}">Reset Password Link</a></p>
           <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: "Email not found" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiration = Date.now() + 3600000;

        const updateSql = "UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?";
        db.query(updateSql, [token, expiration, email], (err, result) => {
            if (err) {
                console.error("Error updating token:", err);
                return res.status(500).json({ error: "Database error" });
            }
            sendResetPasswordEmail(email, token);
            res.json({ message: "Password reset email sent" });
        });
    });
});

// Route to handle password reset
app.post('/reset-password', async(req, res) => {
    const { password, confirmPassword, token } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    const currentTimestamp = Date.now();

    // Query to find user by reset token and check expiration
    const sql = "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires >= ?";

    db.query(sql, [token, currentTimestamp], (err, results) => {
        if (err) {
            console.error("Error finding user by token:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Update user's password in the database
        const updateSql = "UPDATE users SET password = ? WHERE email = ?";

        db.query(updateSql, [password, results[0].email], (err, result) => {
            if (err) {
                console.error("Error updating password:", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({ message: "Password updated successfully" });
        });
    });
});



// Fetch all events
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events", (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// Fetch event by ID
app.get("/api/events/:id", (req, res) => {
    const eventId = req.params.id;
    db.query("SELECT * FROM events WHERE id = ?", [eventId], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result[0]);
    });
});

app.get("/api/events", (req, res) => {
    const sql = "SELECT * FROM events ORDER BY event_date DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ error: "Failed to fetch events" });
        }
        res.json(results);
    });
});

// 📌 Delete Event by ID
app.delete("/api/events/:id", (req, res) => {
    const eventId = req.params.id;
    const sql = "DELETE FROM events WHERE id = ?";

    db.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error("Error deleting event:", err);
            return res.status(500).json({ error: "Failed to delete event" });
        }
        res.json({ message: "Event deleted successfully" });
    });
});

app.get("/api/events/:id", (req, res) => {
    const eventId = req.params.id;
    const sql = "SELECT * FROM events WHERE id = ?";

    db.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error("Error fetching event:", err);
            return res.status(500).json({ error: "Failed to fetch event" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json(result[0]);
    });
});

app.put("/api/events/:id", upload.single("cover_image"), (req, res) => {
    const eventId = req.params.id;
    const { event_title, event_date, event_time, location, description } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    // Step 1: Check for date-location conflict with other events (not the current one)
    const checkSql = "SELECT * FROM events WHERE event_date = ? AND location = ? AND id != ?";
    db.query(checkSql, [event_date, location, eventId], (checkErr, checkResults) => {
        if (checkErr) {
            console.error("Error checking for duplicate event:", checkErr);
            return res.status(500).json({ error: "Failed to validate event date and location" });
        }

        if (checkResults.length > 0) {
            // Conflict found, don't update
            return res.json({
                success: false,
                message: "Another event already exists with the same date and location",
            });
        }

        // Step 2: No conflict, proceed to update
        const updateSql = `
        UPDATE events
        SET event_title = ?, event_date = ?, event_time = ?, location = ?,
            cover_image = COALESCE(?, cover_image), description = ?
        WHERE id = ?
      `;

        db.query(
            updateSql, [event_title, event_date, event_time, location, cover_image, description, eventId],
            (updateErr, result) => {
                if (updateErr) {
                    console.error("Error updating event:", updateErr);
                    return res.status(500).json({ error: "Failed to update event" });
                }

                res.json({ success: true, message: "Event updated successfully" });
            }
        );
    });
});


// 📌 Create New Event with Conflict Check
app.post("/api/events", upload.single("cover_image"), (req, res) => {
    const { event_title, event_date, event_time, location, description } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    // First, check if event with same date & location exists
    const checkSql = "SELECT * FROM events WHERE event_date = ? AND location = ?";
    db.query(checkSql, [event_date, location], (err, results) => {
        if (err) {
            console.error("Error checking event conflict:", err);
            return res.status(500).json({ error: "Server error while checking event conflict" });
        }

        if (results.length > 0) {
            // Event conflict exists
            return res.status(409).json({ error: "An event is already scheduled at this location and date." });
        }

        // No conflict, insert new event
        const insertSql = `
            INSERT INTO events (event_title, event_date, event_time, location, cover_image, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [event_title, event_date, event_time, location, cover_image, description], (err, result) => {
            if (err) {
                console.error("Error inserting event:", err);
                return res.status(500).json({ error: "Server error while creating event" });
            }

            res.json({ message: "Event created successfully" });
        });
    });
});


app.listen(8081, () => {
    console.log("Server running on port 8081");
});