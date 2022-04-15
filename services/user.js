const express = require('express')
const userQuery = require('../db/user')

const router = express.Router()

router.get('/:id', (req, res) => {
    userQuery.getUser(req.params.id)
        .then((data) => {
            res.json(data[0])
        })
        .catch((err) => {
            console.log(err)
        })
})

module.exports = router