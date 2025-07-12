// api/auth/authController.js (UPDATED for Dynamic Email Transporter)
const User = require('./authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// --- NEW: Function to dynamically create and return the transporter ---
function getTransporter() {
    const sendMode = process.env.EMAIL_SEND_MODE;

    switch (sendMode) {
        case 'GMAIL':
            console.log("Using GMAIL transporter...");
            return nodemailer.createTransport({
                host: process.env.GMAIL_HOST,
                port: parseInt(process.env.GMAIL_PORT),
                secure: process.env.GMAIL_SECURE === 'true',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS
                }
            });
        case 'OUTLOOK':
            console.log("Using OUTLOOK transporter...");
            return nodemailer.createTransport({
                host: process.env.OUTLOOK_HOST,
                port: parseInt(process.env.OUTLOOK_PORT),
                secure: process.env.OUTLOOK_SECURE === 'true',
                auth: {
                    user: process.env.OUTLOOK_USER,
                    pass: process.env.OUTLOOK_PASS
                }
            });
        case 'ETHEREAL':
            console.log("Using ETHEREAL transporter...");
            return nodemailer.createTransport({
                host: process.env.ETHEREAL_HOST,
                port: parseInt(process.env.ETHEREAL_PORT),
                secure: process.env.ETHEREAL_SECURE === 'true',
                auth: {
                    user: process.env.ETHEREAL_USER,
                    pass: process.env.ETHEREAL_PASS
                }
            });
        case 'NONE':
            console.log("Email sending is DISABLED.");
            // Return a mock transporter that does nothing
            return {
                sendMail: (options, callback) => {
                    console.log("MOCK EMAIL SEND: Email sending is disabled via EMAIL_SEND_MODE=NONE.");
                    console.log("  Subject:", options.subject);
                    console.log("  To:", options.to);
                    callback(null, { messageId: 'mock-message-id', response: '250 OK (MOCK)' });
                }
            };
        default:
            console.warn("WARNING: Invalid EMAIL_SEND_MODE specified. Defaulting to ETHEREAL.");
            process.env.EMAIL_SEND_MODE = 'ETHEREAL'; // Set default if invalid mode is provided
            return getTransporter(); // Recursively call to get Ethereal transporter
    }
}

// Instantiate the transporter (this will happen once when the module loads)
const transporter = getTransporter(); // <<< UPDATED: Call the function here

exports.registerUser = async (req, res) => {
    const { gamerTag, email, password} = req.body; // 'email' here will be your 10minutemail.com address
    try
    {
        if(gamerTag == null || gamerTag == undefined || email == null || email == undefined || password == null || password == undefined) {
            return res.status(400).json({error : "More data required (gamerTag, email, password)"});
        }

        const existingUser = await User.findOne({$or: [{email}, {gamerTag}]});
        if(existingUser) return res.status(400).json({error : "Email or gamerTag already in use"});

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const emailVerificationExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

        const newUser = new User
        (
            {
                gamerTag, email, passwordHash, level: 1, Bosses: [], Currency: 0, CurrentLoot: [],
                Character: null, currentStats: { strength: 0, dexterity: 0, intelligence: 0, charisma: 0, defense: 0 },
                currentActiveBoss: null, isEmailVerified: false,
                emailVerificationToken, emailVerificationExpires
            }
        )

        await newUser.save();

        const verificationLink = `http://dungeon-dorm.online/verify?token=${emailVerificationToken}`; // Your frontend link

        const mailOptions = {
            from: process.env.EMAIL_USER,          // This will be your Ethereal user ID
            to: newUser.email,                     // This will be the 10minutemail.com address
            subject: 'Verify Your Email for Dungeon Dorm!',
            html: `
                <h1>Welcome to Dungeon Dorm, ${newUser.gamerTag}!</h1>
                <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
                <p><a href="${verificationLink}">Verify My Email</a></p>
                <p>Alternatively, you can use this verification code in your app: <strong>${emailVerificationToken}</strong></p>
                <p>This code is valid for 1 hour.</p>
                <p>If you did not register for Dungeon Dorm, please ignore this email.</p>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`\n--- Verification email sent via Ethereal ---`);
            console.log(`Message ID: ${info.messageId}`);
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`); // <<< CRITICAL: This is where you view the email!
            console.log(`Verification Code (for Postman): ${emailVerificationToken}`); // Still log for convenience
            console.log(`----------------------------------------------\n`);
        } catch (mailError) {
            console.error('Error sending verification email via Ethereal:', mailError);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});

        res.json({
            message: "Registration successful. Please check your email for verification. (Via Ethereal Preview URL in console)",
            token,
            user: { gamerTag: gamerTag, email: email, isEmailVerified: newUser.isEmailVerified }
        });
    }
    catch (err) {
        console.error("Error in registerUser:", err);
        res.status(500).json({error: "Server error during registration"});
    }
};

exports.loginUser = async (req, res) =>
{
    const {gamerTag, password} = req.body;
    if (!gamerTag || !password) { // Added basic validation
        return res.status(400).json({ error: "GamerTag and password are required" });
    }
    try
    {
        const user = await User.findOne({gamerTag});
        if (!user) return  res.status(400).json({ error : "User not found" });

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return res.status(400).json({ error: "Incorrect user/password combination"});

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});
        res.json({token, user: {gamerTag: user.gamerTag, level: user.level}})
    }
    catch (err)
    {
        console.error("Error in loginUser:", err);
        res.status(500).json({ error: "Server error during login"});
    }
};

// New function to find user profile (e.g., for /api/auth/profile)
exports.findUserProfile = async (req, res) =>
{
    // If using verifyToken, req.user will contain the userId from the token
    const userId = req.user.userId;

    try
    {
        if (!userId) {
            return res.status(400).json({error: "User ID not provided from token."});
        }

        // Fetch the user profile by ID, excluding sensitive fields
        const userProfile = await User.findById(userId).select('-passwordHash -isEmailVerified -__v');
        if (!userProfile) {
            return res.status(404).json({error: "User profile not found."});
        }

        res.json({ userProfile });
    }
    catch (err)
    {
        console.error("Error in findUserProfile:", err);
        res.status(500).json({error: "Server error fetching user profile"});
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.json({ message: 'Email successfully verified!' });

    } catch (err) {
        console.error('Error verifying email:', err);
        res.status(500).json({ error: 'Server error during email verification.' });
    }
};