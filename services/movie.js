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
        movie.directors = await await query('select d.id, d.name, d.photo_url from directors as d inner join direct as ds on d.id=ds.director_id where ds.movie_id=?', movie_id)
        movie.actors = await query('select a.id, a.name, a.photo_url, c.character_name from actors as a inner join characters as c on a.id=c.actor_id where c.movie_id=?', movie_id)
        movie.comments = await query('select u.id as user_id, u.name as user_name, u.avatar_url, c.rate, c.content, c.comment_date, c.id as comment_id from comments as c inner join users as u on c.user_id=u.id where c.movie_id=?', movie_id)
        movie.genres = await query('select genres_name from genres where movie_id=?', movie_id)
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
        let movie_name = ''
        let start_time = 0
        let end_time = 2030
        let start_rate = 0
        let end_rate = 10
        let criteria = 'id'
        let asc = true
        if ('name' in req.query) movie_name = req.query.name
        if ('release_year' in req.query)
        {
            start_time = Number(req.query.release_year.split(',')[0])
            end_time = Number(req.query.release_year.split(',')[1])
        }
        if(req.query.orderBy)
        {
            criteria = req.query.orderBy
            asc = (req.query.orderDir == 'asc')? true:false
        } else {
            criteria = 'id'
            asc = true
        }
        if ('rate' in req.query)
        {
            start_rate = Number(req.query.rate.split(',')[0])
            end_rate = Number(req.query.rate.split(',')[1])
        }
        let movie = await query(`
        with search_name as(
            select m.name, m.id, m.cover_url, m.release_year, round(avg(c.rate),1) as rate 
            from movies as m inner join comments as c on c.movie_id = m.id
            where name like concat('%', ?, '%')
            group by m.id
        )
        select name, id, cover_url, release_year, rate
        from search_name
        where release_year between ? and ? and rate between ? and ?
        order by case when ? then ??  else -?? end
        `, movie_name, start_time, end_time, start_rate, end_rate, asc, criteria, criteria)
        res.json({
            status: 0,
            msg: 'searching success',
            data: {movie},
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