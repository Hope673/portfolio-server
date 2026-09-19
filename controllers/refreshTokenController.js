const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const refreshToken =  async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.status(401).json({message: "No refresh token"}) //Unauthorized
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken }).exec()
    if (!foundUser) return res.status(403).json({message: "Forbidden"}) //Forbidden
    // evaluate JWT
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.status(403).json({message: 'Forbidden'})
            
            const accessToken = jwt.sign(
                {
                    "username": decoded.username
                    
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            )
            res.json({ accessToken })
        }
    )
    
    
}

module.exports = { refreshToken }