const query = require('./query')

const sqlDropTables = `
    drop table if exists movies, actors, users, characters, comments
`

const sqlCreateTableMovies = `
    create table if not exists movies(
        id int auto_increment primary key,
        name varchar(20) not null,
        cover_url varchar(255),
        introduction varchar(255),
        release_date date
    )engine=innodb default charset=utf8
`

const sqlCreateTableActors = `
    create table if not exists actors(
        id int auto_increment primary key,
        name varchar(20) not null,
        photo_url varchar(255),
        introduction varchar(255),
        birth_date date
    )engine=innodb default charset=utf8
`

const sqlCreateTableUsers = `
    create table if not exists users(
        id int auto_increment primary key,
        name varchar(20) not null unique,
        password varchar(20) not null
    )engine=innodb default charset=utf8
`

const sqlCreateTableCharacters = `
    create table if not exists characters(
        id int auto_increment primary key,
        character_name varchar(20) not null,
        movie_id int not null,
        actor_id int not null,
        foreign key(movie_id) references movies(id),
        foreign key(actor_id) references actors(id)
    )engine=innodb default charset=utf8
`

const sqlCreateTableComments = `
    create table if not exists comments(
        id int auto_increment primary key,
        rate int not null,
        content varchar(255) not null,
        movie_id int not null,
        user_id int not null,
        foreign key(movie_id) references movies(id),
        foreign key(user_id) references users(id)
    )engine=innodb default charset=utf8
`

const init = async (reset) => {
    try {
        if (reset) await query(sqlDropTables)
        await query(sqlCreateTableMovies)
        await query(sqlCreateTableActors)
        await query(sqlCreateTableUsers)
        await query(sqlCreateTableCharacters)
        await query(sqlCreateTableComments)
        for (let i = 0; i < 15; i++) {
            let name = 'zsf' + i
            await query(`insert into users(name, password) value('${name}', '${i}')`)
        }
    } catch(e) {
        console.log(e)
    }
}

module.exports = init