const express = require('express')
const multer = require('multer')
const auth = require('../services/auth')
const user = require('../services/user')
const movie = require('../services/movie')
const actor = require('../services/actor')
const comment = require('../services/comment')

const router = express.Router()
const upload = multer({ dest: './public/images' })

router.post('/login', auth.login)
router.post('/register', auth.register)

router.use(auth.auth)

router.get('/user/info/:id', user.getUserInfo)
router.get('/user/me/info', user.getMeInfo)
router.post('/user/me/change-avatar', upload.single('avatar'), user.changeMeAvatar)
router.put('/user/me/change-name', user.changeMeName)
router.put('/user/me/change-password', user.changeMePassword)

router.get('/movie/list', movie.listMovies)
router.get('/movie/detail/:id', movie.getMovieDetail)

router.get('/actor/list', actor.listActors)
router.get('/actor/detail/:id', actor.getActorDetail)

router.get('/comment/list', comment.listComments)
router.post('/comment/add-to-movie/:id', comment.addCommentToMovie)

router.use((e) => {
    console.log(e)
    res.json({
        status: 1,
        msg: 'internal server error'
    })
})

module.exports = router