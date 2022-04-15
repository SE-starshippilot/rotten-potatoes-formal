const query = require('./db')

const getUser = (id) => {
    return query(`select * from users where id = ${id}`)
}

module.exports = {
    getUser
}
