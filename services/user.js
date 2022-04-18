const query = require('../db/query')

const getUserInfo = async(req, res) => {
    try {
        let user = await query(`select name from users where id='${req.user_id}'`)
        res.json({
            status: 0,
            data: {
                name: user[0].name
            }
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1,
            msg: e
        })
    }
}

const changeUserName = async(req, res) => {
    try {
        let { new_name } = req.body
        let user = await query(`select * from users where name='${new_name}'`)
        if (user.length >= 1) {
            throw 'user name already exists'
        }
        await query(`update users set name='${new_name}' where id=${req.user_id}`)
        res.json({
            status: 0
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1,
            msg: e
        })
    }
}

const changeUserPassword = async(req, res) => {
    try {
        let { old_password, new_password } = req.body
        let user = await query(`select password from users where id='${req.user_id}'`)
        if (user[0].password !== old_password) {
            throw 'wrong old password'
        }
        await query(`update users set password='${new_password}' where id=${req.user_id}`)
        res.json({
            status: 0
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1,
            msg: e
        })
    }
}

module.exports = {
    getUserInfo,
    changeUserName,
    changeUserPassword
}