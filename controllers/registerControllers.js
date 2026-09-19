const User = require('../models/User')
const bcrypt = require('bcrypt')
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/
const handleNewUser = async (req, res) => {
    const { user, pwd, email } = req.body
    if (!user || !email || !pwd)
        return res.status(400).json({'message': 'Username and Password are required.'})
    if (!PWD_REGEX.test(pwd)) {
        return res.status(400).json({message: 'Password does not meet the security requirement'})
    }
    const duplicate = await User.findOne({email}).exec()
    if (duplicate) 
        return res.status(409).json({message: "Email alraedy in use"})
    try {
        const hashedPwd = await bcrypt.hash(pwd, 10)
        const result = await User.create({
            'username': user, 'password': hashedPwd, email
        })
        return res.status(201).json({'success': `New user ${user} created!`})
    }
    
    catch (err) {
       return res.status(500).json({'message': err.message})
    }
}

module.exports = {handleNewUser}