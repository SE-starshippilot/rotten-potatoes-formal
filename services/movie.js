const query = require('../db/query')

const listMovies = async(req, res, next) => {
    try {
        let perPage = Number(req.query.perPage)
        let page = Number(req.query.page)
        let limit = perPage
        let offset = (page - 1) * perPage
        let items = await query('select id, name, cover_url from movies order by id limit ? offset ?', limit, offset)
        let total = await query('select count(*) from movies')
        total = total[0]['count(*)']
        res.json({
            status: 0,
            data: {
                items,
                total
            }
        })
    } catch(e) {
        next(e)
    }
}

const getMovieDetail = async(req, res, next) => {
    try {
        let movie_id = Number(req.params.id)
        let [ movie ] = await query('select * from movies where id=?', movie_id)
        movie.actors = await query('select a.id, a.name, a.photo_url, c.character_name from actors as a inner join characters as c on a.id=c.actor_id where c.movie_id=?', movie_id)
        movie.comments = await query('select u.id as user_id, u.name as user_name, u.avatar_url, c.rate, c.content, c.comment_date, c.id as comment_id from comments as c inner join users as u on c.user_id=u.id where c.movie_id=?', movie_id)
        let rate = movie.comments.reduce((prev, cur) => prev + cur.rate, 0) / movie.comments.length
        movie.rate = Math.round(((rate + Number.EPSILON) * 10)) / 10
        res.json({
            status: 0,
            data: movie
        })
    } catch(e) {
        next(e)
    }
}



const search_movie = async(req, res, next) => {
    try {
        let {movie_name} = req.body
        await query(`select id, name, cover_url, release_year from movies where name like concat('${movie_name}', '%')`)
        res.join({
            status: 0,
            msg: 'searching success'
        }) 
    }
    catch(e){
        next(e)
    }
}




module.exports = {
    listMovies,
    getMovieDetail,
    search_movie
}