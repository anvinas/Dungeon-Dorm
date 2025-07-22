// api/auth/authController.js
const User = require('./authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Keep nodemailer for getTestMessageUrl for Ethereal, or remove if not needed after switch
const createToken = require("../global/refreshToken")
// --- NEW: SendGrid Integration ---
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Uncomment the line below if you are sending mail using a regional EU subuser
// sgMail.setDaraResidency('eu');


// --- MODIFIED: Function to dynamically create and return the transporter (or SendGrid mock) ---
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
        case 'SENDGRID': // --- NEW CASE FOR SENDGRID ---
            console.log("Using SENDGRID for email sending...");
            // Return a mock object that matches the nodemailer transporter's sendMail signature
            // This allows the existing sendMail calls to work without major refactoring
            return {
                sendMail: async (options) => {
                    const msg = {
                        to: options.to,
                        from: options.from, // Must be a verified sender in SendGrid
                        subject: options.subject,
                        html: options.html,
                        // Add text if you have it in options.text
                        text: options.text || 'Email content' // Provide a fallback text
                    };
                    try {
                        await sgMail.send(msg);
                        console.log('SendGrid Email sent successfully');
                        return { messageId: 'sendgrid-success', response: '202 Accepted (SendGrid)' }; // Mimic nodemailer info object
                    } catch (error) {
                        console.error('SendGrid Email Error:', error);
                        if (error.response) {
                            console.error(error.response.body);
                        }
                        throw error; // Re-throw to be caught by the outer try-catch
                    }
                }
            };
        case 'NONE':
            console.log("Email sending is DISABLED.");
            // Return a mock transporter that does nothing
            return {
                sendMail: (options, callback) => {
                    console.log("MOCK EMAIL SEND: Email sending is disabled via EMAIL_SEND_MODE=NONE.");
                    console.log("   Subject:", options.subject);
                    console.log("   To:", options.to);
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
const transporter = getTransporter(); // <<< Call the function here

exports.registerUser = async (req, res) => {
    const { gamerTag, email, password} = req.body;
    try
    {
        if(gamerTag == null || gamerTag == undefined || email == null || email == undefined || password == null || password == undefined) {
            return res.status(400).json({error : "More data required (gamerTag, email, password)"});
        }
         // Password strength check: 5+ chars, 1 number, 1 special char
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be at least 5 characters long and include a number and a symbol (!, @, etc.)" });
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
                emailVerificationToken, emailVerificationExpires,
                activityState: 'offline',
                currentXP: 0,
                toLevelUpXP: 1000
            }
        )

        await newUser.save();

        const verificationLink = `https://dungeons-dorm.online/verify?token=${emailVerificationToken}`; // Your frontend link

        const mailOptions = {
            from: process.env.SENDGRID_VERIFIED_SENDER_EMAIL, // <<<< CHANGE THIS: Use a SendGrid verified sender email
            to: newUser.email,
            subject: 'Verify Your Email for Dungeon Dorm!',
            html: 
            `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <!--<![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                <xml>
                    <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                <!--[if (gte mso 9)|(IE)]>
            <style type="text/css">
                body {width: 600px;margin: 0 auto;}
                table {border-collapse: collapse;}
                table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
                img {-ms-interpolation-mode: bicubic;}
            </style>
            <![endif]-->
                <style type="text/css">
                body, p, div {
                font-family: inherit;
                font-size: 14px;
                }
                body {
                color: #000000;
                }
                body a {
                color: #1188E6;
                text-decoration: none;
                }
                p { margin: 0; padding: 0; }
                table.wrapper {
                width:100% !important;
                table-layout: fixed;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: 100%;
                -moz-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                }
                img.max-width {
                max-width: 100% !important;
                }
                .column.of-2 {
                width: 50%;
                }
                .column.of-3 {
                width: 33.333%;
                }
                .column.of-4 {
                width: 25%;
                }
                ul ul ul ul  {
                list-style-type: disc !important;
                }
                ol ol {
                list-style-type: lower-roman !important;
                }
                ol ol ol {
                list-style-type: lower-latin !important;
                }
                ol ol ol ol {
                list-style-type: decimal !important;
                }
                @media screen and (max-width:480px) {
                .preheader .rightColumnContent,
                .footer .rightColumnContent {
                    text-align: left !important;
                }
                .preheader .rightColumnContent div,
                .preheader .rightColumnContent span,
                .footer .rightColumnContent div,
                .footer .rightColumnContent span {
                    text-align: left !important;
                }
                .preheader .rightColumnContent,
                .preheader .leftColumnContent {
                    font-size: 80% !important;
                    padding: 5px 0;
                }
                table.wrapper-mobile {
                    width: 100% !important;
                    table-layout: fixed;
                }
                img.max-width {
                    height: auto !important;
                    max-width: 100% !important;
                }
                a.bulletproof-button {
                    display: block !important;
                    width: auto !important;
                    font-size: 80%;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                }
                .columns {
                    width: 100% !important;
                }
                .column {
                    display: block !important;
                    width: 100% !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                .social-icon-column {
                    display: inline-block !important;
                }
                }
            </style>
                <!--user entered Head Start--><link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet"><style>
            body {font-family: 'Muli', sans-serif;}
            </style><!--End Head user entered-->
                </head>
                <body>
                <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                    <div class="webkit">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                        <tr>
                        <td valign="top" bgcolor="#FFFFFF" width="100%">
                            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td width="100%">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                    <td>
                                        <!--[if mso]>
                <center>
                <table><tr><td width="600">
            <![endif]-->
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                <tr>
                                                    <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                <tr>
                <td role="module-content">
                    <p></p>
                </td>
                </tr>
            </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#48261B" data-distribution="1">
                <tbody>
                <tr role="module-content">
                    <td height="100%" valign="top"><table width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                <tbody>
                    <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
                <tbody>
                <tr>
                    <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#280000">
                    </td>
                </tr>
                </tbody>
            </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
                <tbody>
                <tr>
                    <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #000000; font-family: Colfax, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space-collapse: preserve; text-wrap-mode: wrap; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 40px">Welcome to Dungeons And Dormitories, ${newUser.gamerTag}!</span></div><div></div></div></td>
                </tr>
                </tbody>
            </table>
            
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td style="padding: 5px 0;">
                <hr style="border: 0; height: 1px; background-color: #48261B; margin: 0 auto; width: 80%;">
                </td>
            </tr>
            </table>


            
            <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                <tbody>
                <tr>
                    <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px !important; color: #000000 !important;">Thank you for registering. Please verify your email address by clicking the link below:</span></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px !important; color: #000000 !important;"><p><a href="${verificationLink}" style="font-size: 20px; font-weight: bold;">Verify My Email</a></p></span></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px !important; color: #000000 !important;">Alternatively, you can use this verification code in your app: <strong>${emailVerificationToken}</strong></span></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px !important; color: #000000 !important;">This code is valid for 1 hour.</span></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px !important; color: #000000 !important;">If you did not register for Dungeons and Dormitories, please ignore this email.</span></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="color: #c2b280 !important; font-size: 18px"><strong>Thank you and enjoy the game!</strong></span></div><div></div></div></td>
                </tr>
                </tbody>
            </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e.1">
                <tbody>
                <tr>
                    <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#280000">
                    </td>
                </tr>
                </tbody>
            </table></td>
                    </tr>
                </tbody>
                </table></td>
                </tr>
                </tbody>
            </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"><div class="Unsubscribe--addressLine"></div><p style="font-size:12px; line-height:20px;"><a target="_blank" class="Unsubscribe--unsubscribeLink zzzzzzz" href="{{{unsubscribe}}}" style="">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="">Unsubscribe Preferences</a></p></div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
                <tbody>
                    <tr>
                    <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
                        <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                        <tbody>
                            <tr>
                            <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>
                </tbody>
                </table></td>
                                                </tr>
                                                </table>
                                                <!--[if mso]>
                                            </td>
                                            </tr>
                                        </table>
                                        </center>
                                        <![endif]-->
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>
                    </div>
                </center>
                </body>
            </html>
            `
            
            
            /*
            `
                <h1>Welcome to Dungeon Dorm, ${newUser.gamerTag}!</h1>
                <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
                <p><a href="${verificationLink}">Verify My Email</a></p>
                <p>Alternatively, you can use this verification code in your app: <strong>${emailVerificationToken}</strong></p>
                <p>This code is valid for 1 hour.</p>
                <p>If you did not register for Dungeon Dorm, please ignore this email.</p>
            `
            */
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`\n--- Verification email sent via ${process.env.EMAIL_SEND_MODE} ---`);
            console.log(`Message ID: ${info.messageId}`);
            // Note: nodemailer.getTestMessageUrl only works for Ethereal.
            // For SendGrid, you'll rely on SendGrid's dashboard for logs.
            if (process.env.EMAIL_SEND_MODE === 'ETHEREAL' && nodemailer.getTestMessageUrl(info)) {
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            console.log(`Verification Code (for Postman): ${emailVerificationToken}`); // Still log for convenience
            console.log(`----------------------------------------------\n`);
        } catch (mailError) {
            console.error('Error sending verification email:', mailError);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});

        res.json({
            message: `Registration successful. Please check your email for verification. (Via ${process.env.EMAIL_SEND_MODE} - check console for details)`,
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
              // MODIFICATION HERE: Add isEmailVerified to the user object in the response
        res.json({
            token,
            user: {
                character:user.Character,
                gamerTag: user.gamerTag,
                level: user.level,
                isEmailVerified: user.isEmailVerified
            }
        })
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
        // UPDATED: Populate 'Character' AND then populate 'weapon' within 'Character'
        const userProfile = await User.findById(userId)
            .populate({ // Use object syntax for nested population
                path: 'Character', // The first field to populate on UserProfile
                populate: {
                    path: 'weapon' // The field to populate within the CharacterClass document
                }
            })
            .select('-passwordHash -__v')
            .populate('CurrentLoot.itemId');

        if (!userProfile) {
            return res.status(404).json({error: "User profile not found."});
        }
        const newToken = createToken(userId)
        res.json({ userProfile ,token:newToken});
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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body; // User provides their email

    if (!email) {
        return res.status(400).json({ error: 'Email is required to reset password.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // It's a security best practice to send a generic success message
            // even if the email doesn't exist, to prevent enumeration attacks.
            console.warn(`Forgot password attempt for non-existent email: ${email}`);
            return res.status(200).json({ message: 'If a user with that email exists, a password reset email has been sent.' });
        }

        // Generate a password reset token (hex string)
        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Construct the reset link (frontend will handle the token)
        const resetLink = `https://dungeons-dorm.online/reset-password?token=${resetPasswordToken}`;

        const mailOptions = {
            from: process.env.SENDGRID_VERIFIED_SENDER_EMAIL, // <<<< CHANGE THIS: Use a SendGrid verified sender email
            to: user.email,
            subject: 'Dungeon Dorm Password Reset Request',
            html: 
            `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <!--<![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                <xml>
                    <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                <!--[if (gte mso 9)|(IE)]>
            <style type="text/css">
                body {width: 600px;margin: 0 auto;}
                table {border-collapse: collapse;}
                table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
                img {-ms-interpolation-mode: bicubic;}
            </style>
            <![endif]-->
                <style type="text/css">
                body, p, div {
                font-family: inherit;
                font-size: 14px;
                }
                body {
                color: #000000;
                }
                body a {
                color: #1188E6;
                text-decoration: none;
                }
                p { margin: 0; padding: 0; }
                table.wrapper {
                width:100% !important;
                table-layout: fixed;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: 100%;
                -moz-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                }
                img.max-width {
                max-width: 100% !important;
                }
                .column.of-2 {
                width: 50%;
                }
                .column.of-3 {
                width: 33.333%;
                }
                .column.of-4 {
                width: 25%;
                }
                ul ul ul ul  {
                list-style-type: disc !important;
                }
                ol ol {
                list-style-type: lower-roman !important;
                }
                ol ol ol {
                list-style-type: lower-latin !important;
                }
                ol ol ol ol {
                list-style-type: decimal !important;
                }
                @media screen and (max-width:480px) {
                .preheader .rightColumnContent,
                .footer .rightColumnContent {
                    text-align: left !important;
                }
                .preheader .rightColumnContent div,
                .preheader .rightColumnContent span,
                .footer .rightColumnContent div,
                .footer .rightColumnContent span {
                    text-align: left !important;
                }
                .preheader .rightColumnContent,
                .preheader .leftColumnContent {
                    font-size: 80% !important;
                    padding: 5px 0;
                }
                table.wrapper-mobile {
                    width: 100% !important;
                    table-layout: fixed;
                }
                img.max-width {
                    height: auto !important;
                    max-width: 100% !important;
                }
                a.bulletproof-button {
                    display: block !important;
                    width: auto !important;
                    font-size: 80%;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                }
                .columns {
                    width: 100% !important;
                }
                .column {
                    display: block !important;
                    width: 100% !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                .social-icon-column {
                    display: inline-block !important;
                }
                }
            </style>
                <!--user entered Head Start--><link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet"><style>
                        body {font-family: 'Muli', sans-serif;}
                        </style><!--End Head user entered-->
                </head>
                <body>
                <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                    <div class="webkit">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                        <tr>
                        <td valign="top" bgcolor="#FFFFFF" width="100%">
                            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td width="100%">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                    <td>
                                        <!--[if mso]>
                <center>
                <table><tr><td width="600">
            <![endif]-->
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                <tr>
                                                    <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                <tr>
                <td role="module-content">
                    <p></p>
                </td>
                </tr>
            </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#48261B" data-distribution="1">
                            <tbody>
                            <tr role="module-content">
                                <td height="100%" valign="top"><table width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                <tbody>
                    <tr>
                    <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
                            <tbody>
                            <tr>
                                <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#280000">
                                </td>
                            </tr>
                            </tbody>
                        </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
                            <tbody>
                            <tr>
                                <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #000000; font-family: Colfax, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space-collapse: preserve; text-wrap-mode: wrap; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 40px">Dungeons And Dormitories Password Reset for</span></div>
            <div style="font-family: inherit; text-align: center"><span style="color: #000000; font-family: Colfax, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space-collapse: preserve; text-wrap-mode: wrap; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; font-size: 40px">${user.gamerTag}!</span></div><div></div></div></td>
                            </tr>
                            </tbody>
                        </table><table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="5QAnzkPKjqKrme5YGiFhuG">
                <tr>
                    <td height="100%" valign="top" data-role="module-content"><table width="100%" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 5px 0;">
                            <hr style="border: 0; height: 1px; background-color: #48261B; margin: 0 auto; width: 80%;">
                            </td>
                        </tr>
                        </table></td>
                </tr>
                </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                            <tbody>
                            <tr>
                                <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #000000">You are receiving this email because you (or someone else) has requested the reset of your account password.</span></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #000000">Please click the following link or copy and paste it into your browser to complete the process:</span></div>
            <div style="font-family: inherit; text-align: center"><a href="${resetLink}" style="font-size: 20px; font-weight: bold;">Reset My Password</a></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #000000">This link will expire in 1 hour.</span></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #000000">If you did not request this, please ignore this email and your password will remain unchanged.</span></div>
            <div style="font-family: inherit; text-align: center"><br></div>
            <div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #c2b280"><strong>Thank you and enjoy the game!</strong></span></div><div></div></div></td>
                            </tr>
                            </tbody>
                        </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e.1">
                            <tbody>
                            <tr>
                                <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#280000">
                                </td>
                            </tr>
                            </tbody>
                        </table></td>
                    </tr>
                </tbody>
                </table></td>
                            </tr>
                            </tbody>
                        </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"><div class="Unsubscribe--addressLine"></div><p style="font-size:12px; line-height:20px;"><a target="_blank" class="Unsubscribe--unsubscribeLink zzzzzzz" href="{{{unsubscribe}}}" style="">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="">Unsubscribe Preferences</a></p></div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
                            <tbody>
                                <tr>
                                <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
                                    <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                                    <tbody>
                                        <tr>
                                        <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table></td>
                                                </tr>
                                                </table>
                                                <!--[if mso]>
                                            </td>
                                            </tr>
                                        </table>
                                        </center>
                                        <![endif]-->
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>
                    </div>
                </center>
                </body>
            </html>
            `
            
            /*
            `
                <h1>Password Reset for Dungeon Dorm</h1>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetLink}">Reset My Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `
            */
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`\n--- Password reset email sent to ${user.email} via ${process.env.EMAIL_SEND_MODE} ---`);
            console.log(`Message ID: ${info.messageId}`);
            if (process.env.EMAIL_SEND_MODE === 'ETHEREAL' && nodemailer.getTestMessageUrl(info)) {
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            console.log(`Reset Token (for Postman): ${resetPasswordToken}`);
            console.log(`----------------------------------------------\n`);
        } catch (mailError) {
            console.error('Error sending password reset email:', mailError);
            return res.status(500).json({ error: 'Error sending password reset email.' });
        }

        res.status(200).json({ message: 'If a user with that email exists, a password reset email has been sent.' });

    } catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).json({ error: 'Server error during password reset request.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required.' });
    }

    // Password strength check: 5+ chars, 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: "Password must be at least 5 characters long and include a number and a symbol (!, @, etc.)" });
    }

    try {
        // Find user by the reset token and ensure it's not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been successfully reset.' });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Server error during password reset.' });
    }
};