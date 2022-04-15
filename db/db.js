const mysql = require('mysql')
const config = require('./config')

const pool = mysql.createPool(config)

const query = (sql) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err)
            else connection.query(sql, (err, data) => {
                    connection.release()
                    if (err) reject(err)
                    else resolve(data)
                })
        })
    })
}

module.exports = query
