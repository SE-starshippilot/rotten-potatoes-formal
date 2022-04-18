const jwt = require('jsonwebtoken')
const secret = require('./secret')

const signToken = (payload, time) => {
    return jwt.sign(payload, secret, { expiresIn: time })
}

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, data) => err ? reject({}) : resolve(data))
    })
}

module.exports = {
    signToken,
    verifyToken
}