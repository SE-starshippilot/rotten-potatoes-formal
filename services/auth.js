const query = require('../db/query')
const { signToken, verifyToken } = require('../auth/auth')

const login = async(req, res, next) => {
    try {
        let { name, password } = req.body
        let user = await query(`select * from users where name='${name}'`)
        if (user.length < 1 || user[0].password != password) {
            res.json({
                status: 1,
                msg: 'wrong user name or password'
            })
            return
        }
        res.json({
            status: 0,
            data: {
                token: signToken({ user_id: user[0].id }, '1h'),
                msg: 'login successfully'
            }
        })
    } catch(e) {
        next(e)
    }
}

const register = async(req, res, next) => {
    try {
        let { name, password } = req.body
        let user = await query(`select * from users where name='${name}'`) 
        if (user.length >= 1) {
            res.json({
                status: 1,
                msg: 'user name already exists'
            })
            return
        }
        await query(`insert into users(name, password) value('${name}', '${password}')`)
        res.json({
            status: 0,
            msg: 'register successfully'
        })
    } catch(e) {
        next(e)
    }
}

const auth = async(req, res, next) => {
    try {
        let token = req.headers['authorization']
        if (!token) throw Error('no token attached')
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