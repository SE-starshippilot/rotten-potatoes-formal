const mysql = require('mysql')

const config = {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: 'date'
}

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
