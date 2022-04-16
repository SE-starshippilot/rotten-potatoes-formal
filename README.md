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

## Router

* static files
    * `get:/index.html` or `get:/`:
    serve the html

* user
    * `post:/api/user`: 
    request: `{name: 'zsf'}`
    * `delete:/api/user/:id`
    * `put:/api/user/:id`: 
    request: `{name: 'zsf'}`
    * `get:/`
