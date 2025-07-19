const jwt = require('jsonwebtoken');

function createToken(userId) {
    return token = jwt.sign({ userId: userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h'});
}
module.exports = createToken