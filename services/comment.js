const query = require('../db/query')

const listComments = async(req, res, next) => {
    try {
        let comments = await query('select m.name as movie_name, m.cover_url, c.movie_id, c.rate, c.content, c.comment_date, c.user_id, u.name as user_name, u.avatar_url from movies as m inner join comments as c on m.id=c.movie_id inner join users as u on u.id=c.user_id order by c.id')
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
        let movie_id = Number(req.params.id)
        let { rate, content } = req.body
        rate = Number(rate)
        await query('insert into comments(rate, content, comment_date, movie_id, user_id) value(?, ?, now(), ?, ?)', rate, content, movie_id, req.user_id)
        res.json({
            status: 0
        })
    } catch(e) {
        next(e)
    }
}

const delete_comment = async(req, res, next) => {
    try{
        let comment_id = req.params.id
        await query(`delete from comments where id=?`, comment_id)
        res.json({
            status: 0,
            msg: 'delete comments sucessfullt'
        })
    }
    catch(e){
        next(e)
    }
}

module.exports = {
    listComments,
    addCommentToMovie,
    delete_comment
}