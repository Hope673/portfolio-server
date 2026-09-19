const jwt = require('jsonwebtoken')


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401) //Unauthorized
    const token = authHeader.split(' ')[1] // Bearer TOKEN
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403) //Forbidden
            req.user = decoded.username
            next()
        }
    )
}
module.exports = verifyJWT