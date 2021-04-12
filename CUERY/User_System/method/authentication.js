const jwt = require('jsonwebtoken');//https://www.npmjs.com/package/jsonwebtoken
const usermodel = require('../../User_System/UserModel');
var cookieParser = require('cookie-parser');

const authenticationToken = async (req, res, next) => {
    try {
        let token = req.cookies['x-access-token'];
        console.log(token);
        //const decoded = jwt.verify(token, 'Express'); 
        const user = await usermodel.findOne({'tokens.token': token });  //_id: decoded._id,
        if (!user) {          //return res.redirect('/login,html');
        throw new Error(); }
        req.user = user;
        req.token = token;

        next();
    } catch (e) {
        res.status(401);
        res.send({         //return res.redirect('/login.html');
        error: 'Please authenticate.' });
    }
 }

module.exports = authenticationToken;