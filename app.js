require('dotenv').config()

const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const router = require('./router/index')
const init = require('./db/init')

init(reset = process.env.DB_RESET === 'true')

const app = express()

app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/sdk', express.static(path.join(__dirname, 'node_modules', 'amis', 'sdk')))

app.use('/api', router)

app.listen(process.env.PORT || 3000)