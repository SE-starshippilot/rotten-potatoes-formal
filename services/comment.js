const query = require('../db/query')

const listComments = async(req, res, next) => {
    try {
        let comments = await query(`select m.name as movie_name, m.cover_url, c.movie_id, c.rate, c.content, c.comment_time, c.user_id, u.name as user_name, u.avatar_url from movies as m inner join comments as c on m.id=c.movie_id inner join users as u on u.id=c.user_id order by c.id`)
        res.json({
            status: 0,
            data: comments
        })
    } catch(e) {
        next(e)
    }
}

const addCommentToMovie = async(req, res, next) => {
    try {
        let movie_id = req.params.id
        let { rate, content } = req.body
        await query(`insert into comments(rate, content, comment_time, movie_id, user_id) value(${rate}, '${content}', now(), ${movie_id}, ${req.user_id})`)
        res.json({
            status: 0
        })
    } catch(e) {
        next(e)
    }
}

module.exports = {
    listComments,
    addCommentToMovie
}