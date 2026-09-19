const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const handleLogin = async (req, res) => {
  try {
    const { email, pwd } = req.body

    if (!email || !pwd) {
      return res.status(400).json({ message: 'Please fill in all fields' })
    }

    const foundUser = await User.findOne({ email }).exec()
    if (!foundUser) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(pwd, foundUser.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    if (isMatch) {

      const accessToken = jwt.sign(
        {'username': foundUser.username},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30m'}
      )
      const refreshToken = jwt.sign(
        {'username': foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
      )
      foundUser.refreshToken = refreshToken
      await foundUser.save()
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      }
      
      res.cookie('jwt', refreshToken, {...cookieOptions, maxAge: 24 * 60* 60 * 1000})
      res.json({accessToken})
    }
        
    else {
            return res.status(401).json({message: "Invalid email or password"}) //unauthorized
        } 
        
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = {handleLogin}