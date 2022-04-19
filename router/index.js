const express = require('express')
const auth = require('../services/auth')
const user = require('../services/user')
const movie = require('../services/movie')
const actor = require('../services/actor')

const router = express.Router()

router.post('/login', auth.login)
router.post('/register', auth.register)

router.use(auth.auth)

router.get('/user/info', user.getUserInfo)
router.post('/user/change-name', user.changeUserName)
router.post('/user/change-password', user.changeUserPassword)

router.get('/movie/list', movie.listMovies)
router.get('/movie/detail/:id', movie.getMovieDetail)

router.get('/actor/list', actor.listActors)
router.get('/actor/detail/:id', actor.getActorDetail)

module.exports = router