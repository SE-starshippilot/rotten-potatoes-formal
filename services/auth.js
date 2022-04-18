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
                token: signToken({ ...user[0] }, '1h')
            }
        })
    } catch(e) {
        console.log(e)
        res.json({
            status: 1,
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
        })
    }
}

const auth = async (req, res, next) => {
    try {
        let token = req.headers['authorization']
        if (!token) throw 'no token attached'
        req.user = await verifyToken(token)
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