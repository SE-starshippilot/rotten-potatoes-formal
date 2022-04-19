const express = require('express')
const auth = require('../services/auth')
const user = require('../services/user')

const router = express.Router()

router.post('/login', auth.login)
router.post('/register', auth.register)

router.use(auth.auth)

router.get('/user/info', user.getUserInfo)
router.post('/user/change-name', user.changeUserName)
router.post('/user/change-password', user.changeUserPassword)

module.exports = router