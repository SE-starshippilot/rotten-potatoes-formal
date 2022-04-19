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
        for (let i = 1; i <= 21; i++) {
            let movie = '赌神' + i;
            let actor = '周润发' + i;
            await query(`insert into movies(name, cover_url, introduction) value('${movie}', 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg3.027art.cn%2Fimg%2F2021%2F05%2F16%2F1621145716158417.jpg&refer=http%3A%2F%2Fimg3.027art.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652967625&t=48b256519cf76e1ae0eba5f4881b201c', '《赌神》是1989年上映的一部香港赌片。该片是由香港导演王晶执导，周润发、刘德华、张敏、王祖贤等领衔主演的电影。该片讲述了因赌术精湛闻名于世界的赌神高进。 由于意外，高进误入小刀设下的陷井，头部受重伤而失去记忆。高进手下与外敌勾结，企图取代高进的地位并谋夺其家产。一场世界瞩目的赌王大战在公海拉开了帷幕。')`)
            await query(`insert into actors(name, photo_url, introduction, birth_date) value('${actor}', 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fs8.rr.itc.cn%2Fr%2FwapChange%2F20158_8_12%2Fa0210z9400985560405.jpg&refer=http%3A%2F%2Fs8.rr.itc.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652972251&t=787b5e24ea6e1a98824311cff5cafb81', '周润发（Chow Yun Fat），1955年5月18日出生于香港南丫岛，籍贯广东省江门市开平市，华语影视男演员、摄影家。', '1955-05-18')`)
        }
        await query(`insert into users(name, password) value('root', '123')`)
        for (let i = 1; i <= 21; i++) {
            for (let j = 1; j <= 21; j++) {
                await query(`insert into characters(character_name, movie_id, actor_id) value('高进', ${i}, ${j})`)
            }
        }
    } catch(e) {
        console.log(e)
    }
}

module.exports = init