# Rotten Potatoes

## Intro

This is CUHKSZ CSC3170 group project

## Group Members

* zsf
* zby
* ...

## How to Run
1. Set up your database

* Check ./db/config.js:

```js
const config = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'rotten_potatoes'
}
```

substitute `user` field and `password` field with your own mysql user and password
* Create database `rotten_potatoes`:

Simply log into the mysql on your machine and run sql: `create database rotten_potatoes;`

2. Run nodejs server

* Install dependencies: `npm install`
* Run the server: `npm start`
* The server will be running at: "localhost:3000" (visit this url in your browser)
* Login the app with default user with name "root" and password "123"

## Learn
Technology stack used in this project:
* Frontend: [amis](https://aisuda.bce.baidu.com/amis/zh-CN/docs/index)
* Backend: [express](https://expressjs.com)

## Progress
1. Dones:
* login/register/personal center
* movie list and detail
* actor list and detail
* show actors of a movie under the movie's detail page
* show movies that an actor performed under the actor's detail page
* comment list
* show comments on a movie under the movie's detail page
* user detail page
* show comments that a user commented under the user's detail page

2. ToDos: 
* **important**: collect data!!!
* distinguish various cast members: director, actor, ...
* comment on cast members (not necessary)
* pagination on comment list page
* no prompt message/wrong prompt message
* release_date of movie and birth_date of actor

3. Problems:
* CSS problem: actors of a movie/movies of an actor under detail page not on the same line
* CSS problem: instead of ugly "go to user homepage", better to go to homepage once click on user's avatar
* ugly code problem: should get rid of all these catch
```js
} catch(e) {
    console.log(e)
    res.json({
        status: 1,
    })
}
```
