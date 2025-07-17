const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) 
{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
    {
        return res.status(400).json({error: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];

    try 
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) 
    {
        res.status(403).json({error: 'Token invalid or expired'});
    }
}

module.exports = verifyToken;