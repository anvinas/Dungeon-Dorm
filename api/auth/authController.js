const User = require ('./authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { gamerTag, email, password} = req.body;
    try 
    {
        if(gamerTag == null || gamerTag == undefined)  return res.status(400).json({error : "More data required"});
        
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
                Bosses: null,
                Currency: 0,
                CurrentLoot: [],
                Character: null,
                isEmailVerified: false
            }
        )

        await newUser.save();

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});

        res.json({ token, user: {gamerTag: gamerTag, email}});
    }
    catch (err) 
    {
        res.status(500).json({error: "Server error"});
    }
};

exports.loginUser = async (req, res) => 
{
    const {gamerTag, password} = req.body;
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
        res.status(500).json({ error: "Server error"});
    }
};

exports.findUserProfile = async (req, res) =>
{
    const {gamerTag} = req.body;
    try
    {
        if (gamerTag == null || gamerTag == undefined) return (res.status(400).json({error: "Please enter a valid gamertag"}));

        const allUsers = await User.find({});
        console.log("All users in DB:");
        console.log(allUsers);

        const existingUser = await User.findOne({gamerTag}).select('-passwordHash -isEmailVerified -__v');
        if (!existingUser) return (res.status(404).json({error: "User does not exist"}))
        
        res.json({existingUser});
    }
    catch (err)
    {
        res.status(500).json({error: "Server error"});
    }
};
