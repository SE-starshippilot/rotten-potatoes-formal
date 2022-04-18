const express = require('express')
const { login, register, auth} = require('../services/auth')
const { addUser, deleteUser, modifyUser, getAllUsers } = require('../services/user')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)

router.use(auth)

router.post('/user/', addUser)
router.delete('/user/:id', deleteUser)
router.put('/user/:id', modifyUser)
router.get('/user/', getAllUsers)

module.exports = router