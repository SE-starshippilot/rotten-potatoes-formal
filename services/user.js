const res = require('express/lib/response')
const fs = require('fs')
const path = require('path')
const query = require('../db/query')

const userInfo = async(user_id) => {
    let [ user ] = await query('select avatar_url, name from users where id=?', user_id)
    user.comments = await query('select m.id as movie_id, m.name as movie_name, m.cover_url, c.rate, c.content, c.comment_date, c.id as comment_id from movies m inner join comments c on m.id=c.movie_id where c.user_id=?', user_id)
    return user
}  

const getUserInfo = async(req, res, next) => {
    try {
        let user_id = Number(req.params.id)
        let user = await userInfo(user_id)
        res.json({
            status: 0,
            data: user
        })
    } catch(e) {
        next(e)
    }
}

const getMeInfo = async(req, res, next) => {
    try {
        let user_id = Number(req.user_id)
        let user = await userInfo(user_id)
        res.json({
            status: 0,
            data: user
        })
    } catch(e) {
        next(e)
    }
}

const changeMeAvatar = async(req, res, next) => {
    try {
        let user_id = Number(req.user_id)
        let [ { avatar_url } ] = await query('select avatar_url from users where id=?', user_id)
        await query('update users set avatar_url=? where id=?', path.join('images', req.file.filename), user_id)
        if (avatar_url !== null) fs.unlinkSync(path.join(__dirname, '..', 'public', avatar_url))
        res.json({
            status: 0
        })
    } catch(e) {
        next(e)
    }
}

const changeMeName = async(req, res, next) => {
    try {
        let user_id = Number(req.user_id)
        let { new_name } = req.body
        let user = await query('select * from users where name=?', new_name)
        if (user.length >= 1) {
            res.json({
                status: 1,
                msg: 'user name already exists'
            })
            return
        }
        await query('update users set name=? where id=?', new_name, user_id)
        res.json({
            status: 0,
            msg: 'name changed successfully'
        })
    } catch(e) {
        next(e)
    }
}

const changeMePassword = async(req, res, next) => {
    try {
        let user_id = Number(req.user_id)
        let { old_password, new_password } = req.body
        let [ { password } ] = await query('select password from users where id=?', user_id)
        if (password !== old_password) {
            res.json({
                status: 1,
                msg: 'wrong old password'
            })
            return
        }
        await query('update users set password=? where id=?', new_password, user_id)
        res.json({
            status: 0,
            msg: 'password changed successfully'
        })
    } catch(e) {
        next(e)
    }
}


const delete_user = async(req, res, next) => {
    try {
        let inp_password = req.body.password
        let user_id = Number(req.user_id)
        let [{password}] = await query(`select password from users where id= ?`, user_id)
        if (password !== inp_password){
            res.json({
                status: 1,
                msg: 'wrong password'
            })
            return
        }
        await query(`delete from users where id=?`, user_id)
        await query(`update comments set user_id=0 where user_id=?`, user_id)
        res.json({
            status: 0,
            msg: 'delete user successfully'
        })
    }
    catch(e){
        next(e)
    }
}

const search_user = async(req, res, next) => {
    try {
        let user_name = '              '
        if ('name' in req.query)
        {
            user_name = req.query.name
        }
        user = await query(`select id, name, avatar_url from users where name like concat('%' , ?, '%') and id != 0`, user_name)
        res.json({
            status: 0,
            msg: 'searching success',
            data: {user} 
        }) 
    }
    catch(e){
        next(e)
    }
}


module.exports = {
    getUserInfo,
    getMeInfo,
    changeMeAvatar,
    changeMeName,
    changeMePassword,
    delete_user,
    search_user
}