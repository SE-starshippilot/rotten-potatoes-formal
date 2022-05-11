const query = require('./query')

const sqlDropTables = `
    drop table if exists comments, genres, characters, direct, users, movies, actors, directors
`

const sqlCreateTableDirectors = `
    create table if not exists directors(
        id int auto_increment primary key,
        name varchar(255) not null,
        photo_url varchar(255),
        introduction varchar(16383),
        birth_date date,
        index(name),
        index(birth_date)
    )engine=innodb default charset=utf8
`

const sqlCreateTableMovies = `
    create table if not exists movies(
        id int auto_increment primary key,
        name varchar(255) not null,
        cover_url varchar(255),
        introduction varchar(16383),
        release_year year,
        director_id int not null,
        foreign key(director_id) references directors(id),
        index(name),
        index(release_year)
    )engine=innodb default charset=utf8
`

const sqlCreateTableActors = `
    create table if not exists actors(
        id int auto_increment primary key,
        name varchar(255) not null,
        photo_url varchar(255),
        introduction varchar(16383),
        birth_date date,
        index(name),
        index(birth_date)
    )engine=innodb default charset=utf8
`

const sqlCreateTableUsers = `
    create table if not exists users(
        id int auto_increment primary key,
        name varchar(255) not null unique,
        avatar_url varchar(255),
        password varchar(255) not null,
        index(name)
    )engine=innodb default charset=utf8
`

const sqlCreateTableCharacters = `
    create table if not exists characters(
        id int auto_increment,
        character_name varchar(255) not null,
        movie_id int not null,
        actor_id int not null,
        primary key (id, movie_id, actor_id),
        foreign key(movie_id) references movies(id),
        foreign key(actor_id) references actors(id)
    )engine=innodb default charset=utf8
`

const sqlCreateTableComments = `
    create table if not exists comments(
        id int auto_increment,
        rate int not null check (rate>=0 and rate<=10),
        content varchar(16383) not null,
        comment_date date not null,
        movie_id int not null,
        user_id int not null,
        primary key(id, user_id, movie_id),
        foreign key(user_id) references users(id),
        foreign key(movie_id) references movies(id)
    )engine=innodb default charset=utf8
`

const sqlCreateTableGenres = `
    create table if not exists genres(
        movie_id int not null,
        genres_name varchar(15) not null,
        primary key(genres_name, movie_id),
        foreign key (movie_id) references movies(id)
    )engine=innodb default charset=utf8
`


const init = async (reset) => {
    try {
        if (reset) await query(sqlDropTables)
        await query(`SET GLOBAL sql_mode='NO_AUTO_VALUE_ON_ZERO'`)
        await query(`SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO'`)
        
        await query(sqlCreateTableDirectors)
        await query(sqlCreateTableMovies)
        await query(sqlCreateTableActors)
        await query(sqlCreateTableUsers)
        await query(sqlCreateTableCharacters)
        await query(sqlCreateTableComments)
        await query(sqlCreateTableGenres)
        
        await query(`insert into users (id, name, avatar_url, password) values (0, 'User deleted', 'https://images-na.ssl-images-amazon.com/images/M/MV5BMjQ4MTY5NzU2M15BMl5BanBnXkFtZTgwNDc5NTgwMTI@._V1_.jpg', '123') `)
        await query(`set global local_infile=1`)
        await query(`load data local infile 'data/directors.csv' into table directors fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/movies.csv' into table movies fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/actors.csv' into table actors fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/users.csv' into table users fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/characters.csv' into table characters fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/comments.csv' into table comments fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`load data local infile 'data/genres.csv' into table genres fields terminated by ',' enclosed by '"' ignore 1 rows`)
        await query(`set global local_infile=0`)


        let root = await query(`select * from users where name='root'`)
        if (root.length === 0) await query(`insert into users(name, password) value('root', '123')`)
    } catch(e) {
        console.log(e)
    }
}

module.exports = init