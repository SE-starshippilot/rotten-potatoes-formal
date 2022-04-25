const mysql = require('mysql')
const config = require('./config')

const pool = mysql.createPool(config)

const query = (sql, ...args) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err)
            else connection.query(sql, [...args], (err, data) => {
                    connection.release()
                    if (err) reject(err)
                    else resolve(data)
                })
        })
    })
}

module.exports = query
