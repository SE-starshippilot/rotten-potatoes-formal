const query = require('../db/query')
const { signToken, verifyToken } = require('../auth/auth')

const login = async(req, res) => {
    try {
        let { name, password } = req.body
        let user = await query(`select * from users where name='${name}'`)
        if (user.length < 1 || user[0].password != password) {
            throw 'wrong user name or password'
        }
        res.json({
            status: 0,
            data: {
                token: signToken({ user_id: user[0].id }, '1h')
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

const register = async(req, res) => {
    try {
        let { name, password } = req.body
        let user = await query(`select * from users where name='${name}'`) 
        if (user.length >= 1) {
            throw 'user name already exists'
        }
        await query(`insert into users(name, password) value('${name}', '${password}')`)
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

const auth = async(req, res, next) => {
    try {
        let token = req.headers['authorization']
        if (!token) throw 'no token attached'
        let user = await verifyToken(token)
        req.user_id = user.user_id
        next()
    } catch(e) {
        res.json({
            status: 401,
            msg: 'not logined yet'
        })
    } 
}

module.exports = {
    login,
    register,
    auth
}