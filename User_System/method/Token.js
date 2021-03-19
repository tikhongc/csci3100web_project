const jsonwebtoken = require('jsonwebtoken');


const Tokenfun = async()=>{
    //generat a token 
    const token = jsonwebtoken.sign({_id:'wqeqe'},'ewqeqeqwe',{expiresIn:'1 month'});//assigned value and valid time
    console.log(token);
    //verify token
    const matching = jsonwebtoken.verify(token,'ewqeqeqwe');
    console.log(matching);
}
Tokenfun();