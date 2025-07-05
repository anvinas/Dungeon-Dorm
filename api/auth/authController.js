// api/auth/authController.js
const User = require('./authModel'); // This line remains exactly as you wanted
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { gamerTag, email, password} = req.body;
    try
    {
        if(gamerTag == null || gamerTag == undefined || email == null || email == undefined || password == null || password == undefined) { // Added checks for email and password
            return res.status(400).json({error : "More data required (gamerTag, email, password)"});
        }

        const existingUser = await User.findOne({$or: [{email}, {gamerTag}]});
        if(existingUser) return res.status(400).json({error : "Email or gamerTag already in use"});

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User
        (
            {
                gamerTag,
                email,
                passwordHash,
                level: 1,
                Bosses: null, // Ensure this matches your Boss schema if populated
                Currency: 0,
                CurrentLoot: [], // Initialize as empty array for new users
                Character: null, // Ensure this matches your Character schema if populated
                isEmailVerified: false
            }
        )

        await newUser.save();

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});

        res.json({ token, user: {gamerTag: gamerTag, email}});
    }
    catch (err)
    {
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