const User = require('../models/User')

const handleLogout =  async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    const refreshToken = cookies.jwt

    const foundUser = await User.findOne({ refreshToken }).exec()
    if (!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite:'none', secure:true, })
        return res.sendStatus(204) 
    }
    foundUser.refreshToken = ''
    const result = await foundUser.save()

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
    res.clearCookie('jwt', cookieOptions) // secure: true - only serves on https
    res.sendStatus(204) 
    
}    
module.exports = { handleLogout }