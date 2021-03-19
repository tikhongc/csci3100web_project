

//a Router API file

//file to store and manipulate user data and output a router

const express = require('express');
const {update} = require('./UserModel');
require('../mongodb/mongoose');
const usermodel = require('./UserModel')
//creating a new router
const User = new express.Router();
const sendEmail = require('./method/Email').message; //test email

//POST：提交資料，新增一筆新的資料（如果存在會新增一筆新的）
//PUT：更新一筆資料，如果存在這筆資就會覆蓋過去
//PATCH：部分更新資料
//DELETE：刪除資料

const authentication=require('./method/Authtication');


//User log system:
//1.User Signin 
//2.Uer Login  
//3.Uer Logout 
//4.User Recovery (server side)

//post usermodel on body
//sign in
User.post('/user',  (req, res)=> {
    const user = new usermodel(req.body);//get userinput
    try{
       await user.save();//save user
       //sendEmail();
       //generate a token for the saved user and send back both toke and user
       const token = await userFound.authenticationToken();
       res.status(201);
       res.send({user,token});
    }catch(error){
      res.status(400);
      res.send(error);
    }
 })

 //for user to log in //need a login page
 User.post('/user/login',async(req,res)=>{
    try{
        //findbycredemtoals
        //compare user email and password in database and stored as const
        //const userFound = await
        //use authentication function here

        //reuse token generate before
        const token = await userFound.authenticationToken();
        //send user and token infomation if matched
        //hide the private user data    
        //res.send({user : usermodel.publicData(),token});     
    }catch(error){
       res.status(400);//bad request
       res.send(error);
    }

})

User.post('/user/logout',async(req,res)=>{
   try{
       //remove token  when log out 
       //can user filter function to match token here
       //save user and send back information
   }catch(error){
    res.status(500);//bad request
    res.send(error);
   }
})

 
 //User management:(server side)

 //1.fetch all user inforation
 //2.fetch user information by searching _id
 //3.update user information by searching _id
 //4.delete user information by searching _id
 //5.get user authentication information

 //use to fetch all users information stored in database and show it on body,it return a promise
 User.get('/user',(req,res)=>{
     usermodel.find({}).then((users)=>{
         res.send(users);
     }).catch((error)=>{
        res.status(500);//bad request
         res.send(error);
     })
 })

 //fetch a user by id
 User.get('/user/search/:id',(req,res)=>{
     const object_id = req.params.id;
     usermodel.findById(object_id).then((user)=>{
        if(!user){
            res.status(404)
            return res.send('404 NOT FOUND');
        }
        res.status(200).send(user);
    }).catch((error)=>{
       res.status(500);//bad request
       res.send(error);
    })
})


//When a client needs to replace an existing Resource entirely, they can use PUT. 
//When they're doing a partial update, they can use HTTP PATCH.
//update user by id
User.patch('/user/update',async(req,res)=>{

    //only allow to update the atrribute included in user model
    const up = Object.keys(req.body);
    const allowupdate=['name','password','year','email'];//and so on
    const valid = up.every((update)=>{
       return allowupdate.includes(update);
    })
    if(!valid){
        res.status(400);
        return res.send('Invalid updates.')
    }
    
    //update code
    try{
        
        const user = await usermodel.findById(req.params.id);
        // allow to update many times
        up.forEach((update)=>{
          user[update]=req.body[update];
        })
        //ensure middleware run correctly 
        await user.save();

       if(!user){
        res.status(404)
        return res.send('404 NOT FOUND');
    }
    res.status(200).send(user);
    }catch(error){
        res.status(400);//bad request
        res.send(error);
    }
})

//delete user by their id
User.delete('/user/delete',async(req,res)=>{
    try{
        const user = await usermodel.findByIdAndDelete(req.params._id);
        if(!user){
            res.status(404)
            return res.send('404 NOT FOUND');
        }

        res.status(200).send(user);
    }catch(error){
        res.status(500);//bad request
        res.send(error);
    }
})

//get user authentication information 
//see system/method/authtication.js
User.get('/user/auth',async(req,res)=>{
    try{
 
    }catch(error){

    }
})

//reference: 
//https://medium.com/mesan-digital/tutorial-3b-how-to-add-password-reset-to-your-node-js-authentication-api-using-sendgrid-ada54c8c0d1f
//https://stackoverflow.com/questions/42682923/password-reset-in-nodejs

//Reset password:

//Password RESET
User.post('/recover', [
],);

User.get('/reset/:token', );

User.post('/reset/:token', [
   
],);

//user recovery
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
    }
});

User.get('/recover/:id', (req, res) => {
    const user_id = req.params.id;
    const send_email = usermodel.findOne({id: user_id}).email;
    var recovery_key = 12341; //should be random
    var mailOptions = {
    from: 'youremail@gmail.com',
    to: send_email,
    subject: 'Test email using nodejs',
    text: recovery_key
    };
    transporter.sendMail(mailOptions, function(error, info){
       if (error){
           console.log(error);
       } 
       else{
           console.log('Email sent: '+ info.response);
       }
    });
});




 module.exports = User;
 
 //fetch a user by email
 //not needed yet
//  User.get('/user/:email',async(req,res)=>{
//     const email = req.params.email;
//     try{
//         const user = await usermodel.findOne(email);
//         if(!user){
//             res.status(404)
//             return res.send('404 NOT FOUND');
//         }
//         res.status(200).send(user);
//     }catch(error)
//     {
//         res.status(500);//bad request
//        res.send(error);
//     }
// })


