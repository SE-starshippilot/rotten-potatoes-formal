const query = require('../db/query')

const listMovies = async(req, res) => {
    try {
        let limit = req.query.perPage
        let offset = (req.query.page - 1) * req.query.perPage
        let items = await query(`select id, name, cover_url from movies order by id limit ${limit} offset ${offset}`)
        let total = await query(`select count(*) from movies`)
        total = total[0]['count(*)']
        res.json({
            status: 0,
            data: {
                items,
                total
            }
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1,
        })
    }
}

const getMovieDetail = async(req, res) => {
    try {
        let movie = await query(`select * from movies where id=${req.params.id}`)
        res.json({
            status: 0,
            data: movie[0]
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1
        })
    }
}

module.exports = {
    listMovies,
    getMovieDetail
}