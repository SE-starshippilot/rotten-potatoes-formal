const express = require('express')
const { login, register, auth} = require('../services/auth')
const { getUserInfo, changeUserName, changeUserPassword } = require('../services/user')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)

router.use(auth)

router.get('/user/info', getUserInfo)
router.post('/user/change-name', changeUserName)
router.post('/user/change-password', changeUserPassword)

module.exports = router