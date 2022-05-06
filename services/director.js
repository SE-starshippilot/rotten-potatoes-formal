const query = require('../db/query')

const listDirectors = async(req, res, next) => {
    try {
        let perPage = Number(req.query.perPage)
        let page = Number(req.query.page)
        let limit = perPage
        let offset = (page - 1) * perPage
        let items = await query('select id, name, photo_url from directors order by id limit ? offset ?', limit, offset)
        let total = await query('select count(*) from directors')
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

const getDirectorDetail = async(req, res, next) => {
    try {
        let director_id = Number(req.params.id)
        let [ director ] = await query('select * from directors where id=?', director_id)
        director.movies = await query('select m.id, m.name, m.cover_url from movies as m inner join direct as d on m.id=d.movie_id where d.director_id=?', director_id)
        res.json({
            status: 0,
            data: director
        })
    } catch(e) {
        next(e)
    }
}


const search_Director = async(req, res, next) => {
    try {
        let director_name = ''
        if ('name' in req.query) director_name = req.query.name
        let start_date = '1800-1-1'
        let end_date = '2050-1-1'
        let criteria = 'id'
        let asc = true
        if ('birth_date' in req.query)
        {
            start_date = req.query.birth_date.split(',')[0]
            end_date = req.query.birth_date.split(',')[1]
        }
        if(req.query.orderBy)
        {
            criteria = req.query.orderBy
            asc = (req.query.orderDir == 'asc')? true:false
        } else {
            criteria = 'id'
            asc = true
        }
        let directors = await query(`select id, name, photo_url, birth_date from directors where name like concat('%' , ? , '%')
        and birth_date between ? and ?
        order by case when ? then ??  else -?? end`, director_name, start_date, end_date,asc, criteria, criteria)
        res.json({
            status: 0,
            msg: 'searching success',
            data: directors
        }) 
    }
    catch(e){
        next(e)
    }
}

module.exports = {
    listDirectors,
    getDirectorDetail,
    search_Director
}