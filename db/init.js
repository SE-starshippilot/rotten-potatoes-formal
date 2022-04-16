const query = require('./query')

const sqlDropTables = `
    drop table if exists users
`

const sqlCreateTableUsers = `
    create table if not exists users(
        id int auto_increment primary key,
        name varchar(20) not null unique
    )engine=innodb default charset=utf8
`

const init = async (reset) => {
    try {
        if (reset) await query(sqlDropTables)
        await query(sqlCreateTableUsers)
        for (let i = 0; i < 15; i++) {
            let name = 'zsf' + i
            await query(`insert into users(name) value('${name}')`)
        }
    } catch(e) {
        console.log(e)
    }
}

module.exports = init