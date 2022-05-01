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
        foreign key(movie_id) references movies(id)
    )engine=innodb default charset=utf8
`



const init = async (reset) => {
    try {
        if (reset) await query(sqlDropTables)
        await query(`SET GLOBAL sql_mode='NO_AUTO_VALUE_ON_ZERO'`)
        await query(`SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO'`)

        await query(sqlCreateTableMovies)
        await query(sqlCreateTableActors)
        await query(sqlCreateTableUsers)
        await query(sqlCreateTableCharacters)
        await query(sqlCreateTableComments)
        await query(sql_create_movie_idx)
        await query(sql_create_actor_idx)
        await query(sql_create_user_idx)
    
        
        await query(`insert into users (id, name, avatar_url, password) values (0, 'User deleted', 'https://images-na.ssl-images-amazon.com/images/M/MV5BMjQ4MTY5NzU2M15BMl5BanBnXkFtZTgwNDc5NTgwMTI@._V1_.jpg', '123') `)
        await query(`set global local_infile=1`)
        await query(`load data local infile 'data/movies.csv' into table movies fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/actors.csv' into table actors fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/users.csv' into table users fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/characters.csv' into table characters fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`load data local infile 'data/comments.csv' into table comments fields terminated by ',' enclosed by '"' lines terminated by '\r\n' ignore 1 rows`)
        await query(`set global local_infile=0`)


        let root = await query(`select * from users where name='root'`)
        if (root.length === 0) await query(`insert into users(name, password) value('root', '123')`)
    } catch(e) {
        console.log(e)
    }
}

module.exports = init