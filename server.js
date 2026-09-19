require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const { logger } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const cookieparser = require('cookie-parser')
const connectDB = require('./config/db')
const credentials = require('./middleware/credentials')

const mongoose = require('mongoose')

connectDB()

const PORT = process.env.PORT || 5000
app.use(helmet())


app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body)
  if (req.params) req.params = mongoSanitize.sanitize(req.params)
  next()
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {message: 'Too many attempts, please try again later'},
  standardHeaders: true,
  legacyHeaders: false
})
app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieparser())

app.use('/register', authLimiter, require('./routes/register'))
app.use('/auth', authLimiter, require('./routes/authRoutes'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))

app.use('/contact', require('./routes/contactRoutes'))


app.all(/(.*)/, (req, res) => {
  res.status(404).json({ error: '404 Not found' })
})

app.use(errorHandler)
mongoose.connection.once('open', () => {
  console.log('Connected to mongoDB')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})


