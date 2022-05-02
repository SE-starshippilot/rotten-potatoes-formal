const query = require('../db/query')

const listActors = async(req, res, next) => {
    try {
        let perPage = Number(req.query.perPage)
        let page = Number(req.query.page)
        let limit = perPage
        let offset = (page - 1) * perPage
        let items = await query('select id, name, photo_url from actors order by id limit ? offset ?', limit, offset)
        let total = await query('select count(*) from actors')
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

const getActorDetail = async(req, res, next) => {
    try {
        let actor_id = Number(req.params.id)
        let [ actor ] = await query('select * from actors where id=?', actor_id)
        actor.movies = await query('select m.id, m.name, m.cover_url, c.character_name from movies as m inner join characters as c on m.id=c.movie_id where c.actor_id=?', actor_id)
        res.json({
            status: 0,
            data: actor
        })
    } catch(e) {
        next(e)
    }
}


const search_actor = async(req, res, next) => {
    try {
        let actor_name = ''
        if ('name' in req.query) actor_name = req.query.name
        let start_date = '1800-1-1'
        let end_date = '2050-1-1'
        if ('birth_date' in req.query)
        {
            start_date = req.query.birth_date.split(',')[0]
            end_date = req.query.birth_date.split(',')[1]
        }
        let actors = await query(`select id, name, photo_url, birth_date from actors where name like concat('%' , ? , '%')
        and birth_date between ? and ?`, actor_name, start_date, end_date)
        res.json({
            status: 0,
            msg: 'searching success',
            data: actors
        }) 
    }
    catch(e){
        next(e)
    }
}

module.exports = {
    listActors,
    getActorDetail,
    search_actor
}