const query = require('./query')

const sqlDropTables = `
    drop table if exists characters, comments, movies, actors, users
`

const sqlCreateTableMovies = `
    create table if not exists movies(
        id int auto_increment primary key,
        name varchar(255) not null,
        cover_url varchar(255),
        introduction varchar(16383),
        release_year year
    )engine=innodb default charset=utf8
`

const sql_create_movie_idx = `
    create index movie_name on movies(name)
`

const sqlCreateTableActors = `
    create table if not exists actors(
        id int auto_increment primary key,
        name varchar(255) not null,
        photo_url varchar(255),
        introduction varchar(16383),
        birth_date date
    )engine=innodb default charset=utf8
`

const sql_create_actor_idx = `
    create index actor_name on actors(name)
`


const sqlCreateTableUsers = `
    create table if not exists users(
        id int auto_increment primary key,
        name varchar(255) not null unique,
        avatar_url varchar(255),
        password varchar(255) not null
    )engine=innodb default charset=utf8
`

const sql_create_user_idx = `
    create index user_name on users(name)
`


const sqlCreateTableCharacters = `
    create table if not exists characters(
        id int auto_increment primary key,
        character_name varchar(255) not null,
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
        content varchar(16383) not null,
        comment_date date not null,
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
        await query(sql_create_movie_idx)
        await query(sql_create_actor_idx)
        await query(sql_create_user_idx)
        

        await query(`set global local_infile=1`)
        await query(`load data local infile 'data/movies.csv' into table movies fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/actors.csv' into table actors fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/users.csv' into table users fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/characters.csv' into table characters fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/comments.csv' into table comments fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`set global local_infile=0`)
    } catch(e) {
        console.log(e)
    }
}

module.exports = init