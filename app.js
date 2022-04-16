const express = require('express')
const path = require('path')
const router = require('./router/index')
const init = require('./db/init')
const bodyParser = require('body-parser');

let reset = true
init(reset)

const app = express()

app.use('/', express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api', router)

app.listen(3000)