//file to store and manipulate user data and output a router

require('../mongodb/mongoose');
const fs = require('fs');
const objectid = require('mongodb').ObjectID;
const express = require('express');
const bcrypt = require('bcryptjs');
const UserModel = require('./UserModel');
const {WelcomeEmail, RecoveryEmail,ConfirmationEmail} = require('../User_System/method/email');
const authentication=require('../User_System/method/authentication');
const User = new express.Router(); 

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './CUERY/User_System/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        cb(null, true);
    else
        cb(null, false);
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

// function to check unique email also
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

//User log system:
//1.User Signup
//2.Uer Login  
//3.Uer Logout 
//4.User Recovery (server side)
  
 User.post('/user_create', async(req, res)=> {
    const newUser = new UserModel({
        name: req.body.username,
        email: req.body.newEmail,
        password: req.body.newPassword,
        year: req.body.year,
    });
    newUser.avatar.data = fs.readFileSync("./CUERY/public/img/avatar.png");
    newUser.avatar.contentType = "image/png";
    
    if (!validateEmail(req.body.newEmail))
        return res.redirect('/registration.html?invalid=2');
    else{
        try{
            await newUser.save();//save user
            console.log("Created");
            WelcomeEmail(req.body.newEmail, req.body.username);     //send welcome email
            //const token = await newUser.Token();        //generate a token for the saved user and send back both toke and user
            res.redirect('/redirection.html');
           //res.send({newUser,token});
        }catch(error){
          res.redirect('/registration.html?invalid=1');
          //res.send(error);
        }
    }
    })

 //for user to log in 
 User.post('/login',async(req,res)=>{
    try{
         //compare user email and password in database and stored as const      
         const {email, password } = req.body;
         
         const user = await UserModel.findOne({ email : email });
         if (!user) {
             //if error:not user be found
            //res.send('account does not exist!');
            return res.redirect('/login.html?loginError=1');
        } 
        const isMatch = await bcrypt.compare(password, user.password);//hash password
        if (!isMatch) {    
          //then compare hashed password with password stored in database
          return res.redirect('/login.html?loginError=2');
        }
         //const user = await User.login(email, password);//login_authentication
        const token = await user.Token();
        console.log("Login Successfully.");
        let options = {
            path:"/",
            sameSite:true,
            maxAge: 1000 * 60 * 60 * 24, // would expire after 24 hours
            //httpOnly: true, // The cookie only accessible by the web server
        }    
        res.cookie('x-access-token',token, options);
        res.redirect('/main.html');
        //res.send({ user, token });
    }catch(error){
       res.status(400);//bad request
       res.send(error);
    }
})

//logout
User.post('/logout',authentication, async(req,res)=>{
   try{
     //remove token  when log out 
    req.user.tokens = [];
    await req.user.save();       //save user and send back information
    res.send({note: 'success'});
   }catch(error){
    res.status(500);//bad request
    res.send(error);
   }
})

//get passwordReset
User.get('/forgot',async (req, res,next) => {
    try{
         res.render('forgot');
    }
    catch(error){
        res.status(400).send(error);
    }
})

//User recovery
const { check  } = require('express-validator');
const validator = require('./method/validator');
//forgot password request
User.post("/forgot", [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('email').not().isEmpty(),
  ],validator,
  async (req, res) => {
    try{
        const {email} = req.body;
        const user = await UserModel.findOne({ email : email });

        if (!user) {
            //account dose not exist!
            return res.status(401).json({message: 'The email address ' + email + 
            ' is not associated with any account. Double-check your email address and try again.'});
         } 

       await user.ResetPassword();
       let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
       console.log(link);
       RecoveryEmail(user.email,user.name,link);
       res.status(200).send('Account activation email has been sent,please check your mailbox.');
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

//get passwordReset
User.get('/reset/:token',async (req, res,next) => {
    try{
        const user = await UserModel.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}});
        if (!user) {
            return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
         } 
         res.render('reset',{token: req.params.token});
    }
    catch(error){
        res.status(400).send(error);
    }
})

//Reset password
User.post('/reset/:token',[
    check('password').not().isEmpty().isLength({min: 8}).withMessage('Must be at least 8 chars long'),
  ],validator,
  async (req, res) => {
    try{
        const user = await UserModel.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}});
        if (!user) {
            return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
         } 
         //Set the new password
         user.password = req.body.password;         
         user.resetPasswordToken = undefined;
         user.resetPasswordExpires = undefined;

         await user.save();
         ConfirmationEmail(user.email,user.name);
         res.status(200).json({message: 'Your password has been updated.'});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})

 
 //User API :

 //1.fetch user own profile
 //2.fetch user information by searching _id
 //3.update user information by searching _id
 //4.delete user information by searching _id
 //5.fetch all the posts creating by a user
 //6.fetch all the posts creating by a user

//for user to get own profile
User.get('/profile', authentication, async (req, res) => {
    res.send(req.user);
})


 //fetch a user by id
 User.get('/search/:id',(req,res)=>{
    const object_id = req.params.id;
    UserModel.findById(object_id).then((user)=>{
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

//fetch all posts creating by a user
User.get('/user/posts/:id' , async(req,res)=>{
    const object_id = req.params.id;
    try {
        const user = await UserModel.findById(object_id)
        if (!user) {
            res.status(404)
            return res.send('404 NOT FOUND'); 
        }
        await user.populate('Post').execPopulate();
        res.status(200).send(user.Post);
        
    } catch (e) {
        res.status(500).send();
    }
})

//fetch all  comments creating by a user
User.get('/user/comments/:id' , async(req,res)=>{
    const object_id = req.params.id;
    try {
        const user = await UserModel.findById(object_id)
        if (!user) {
            res.status(404)
            return res.send('404 NOT FOUND'); 
        }
        await user.populate('Comment').execPopulate();
        res.status(200).send(user.Comment);
    } catch (e) {
        res.status(500).send();
    }
})

User.post('/update',authentication, upload.single('avatar'),async(req,res,next)=>{
    
    const isMatch = await bcrypt.compare(req.body.oldpw, req.user.password);
    if (!isMatch){
        return res.redirect("/userupdate.html?error=1")
    }
    
    if (req.body.name !== ""){
        const user = await UserModel.findOne({ name : req.body.name });
        if (user){
            if (user.name !== req.user.name){
                return res.redirect("/userupdate.html?error=2")
            }
        }
    }
    if (req.body.email !== ""){
        const useremail = await UserModel.findOne({ email : req.body.email });
        if (useremail){
            if (useremail.email !== req.user.email){
                return res.redirect("/userupdate.html?error=3")
            }
        }
        if (!validateEmail(req.body.email))
            return res.redirect('/userupdate.html?error=4');
    }
    const updateUser = {
        year: req.body.year
    };
    if (req.body.name !== ""){
        updateUser["name"] = req.body.name;
    }
    if (req.body.bio !== ""){
        updateUser["bio"] = req.body.bio;
    }
    if (req.body.password !== ""){
        updateUser["password"] = await bcrypt.hash(req.body.password,8); 
    }
    if (req.body.email !== ""){
        updateUser["email"] = req.body.email;
    }
    if (req.file){
        updateUser["avatar"] = { 
            data: fs.readFileSync(path.join("./CUERY/User_System/uploads/" + req.file.filename)),
            contentType: req.file.mimetype
        }
    }
    await UserModel.updateOne({name: req.user.name}, {$set: updateUser}, (err, result) =>{
        if (err){
            res.status(500); // bad request
            console.log(err);
        }
        console.log("updated");
        res.redirect("user.html?success");
    })
});
/*
//update user by id
User.post('/update',authentication, upload.single('avatar'),async(req,res,next)=>{
    //only allow to update the atrribute included in user model
    console.log(req.user);
    var updateuser = {
        name: req.body.name,
        email: req.body.email,
        bio: req.body.bio,
        password: req.body.password,
        oldpw: req.body.oldpw,
        year: req.body.year,
        avatar:{
            data: fs.readFileSync(path.join("./CUERY/User_System/uploads/" + req.file.filename)),
            contentType: req.file.mimetype
        }
    }
    
    const up = Object.keys(obj);
    const allowupdate=['name','password','year','email','bio','pre','avatar'];//and 
    const valid = up.every((update)=>{
        return allowupdate.includes(update);
     })    
     if(!valid){
        res.status(400);
        return res.send('Invalid updates.')
    }
    //update code
    try{
        // allow to update many times
        up.forEach((update)=>{
         req.user[update]=obj[update];
        })
        await req.user.save();
        res.status(200);
        res.send(req.user);
    }catch(error){
        res.status(400);//bad request
        res.send(error);
    }
})
*/

//only server-side allowed management:

//use to fetch all users information stored in database and show it on body,it return a promise
User.get('/users/all',(req,res)=>{
    UserModel.find({}).then((users)=>{
        res.send(users);
    }).catch((error)=>{
       res.status(500);//bad request
        res.send(error);
    })
})


//delete user by id
User.delete('/delete/:id',async(req,res)=>{
        const object_id = req.params.id;
        UserModel.findByIdAndDelete(object_id).then((user)=>{
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

User.post('/checkCookie', async (req, res)=>{
    try{
        console.log(req.body.userCookie);
        const user = await UserModel.findOne({ 'tokens.token' : req.body.userCookie });
        if (!user) {
            //if error:not user be found
            console.log("CANNOT FIND user with token");
            res.send({answer: 'NA'});
        }
        else{
            console.log("have user logged in");
            res.send(user);
        }
    } catch(error){
        res.send(error);
    }
});

module.exports = User;

//reference: 
//https://medium.com/mesan-digital/tutorial-3b-how-to-add-password-reset-to-your-node-js-authentication-api-using-sendgrid-ada54c8c0d1f
//https://stackoverflow.com/questions/42682923/password-reset-in-nodejs

 

//  const emailValidator = require('deep-email-validator');
 
//  async function isEmailValid(email) {
//   return emailValidator.validate(email)
//  }


// router.post('/register', async function(req, res, next) {
//   const {email, password} = req.body;
 
//   if (!email || !password){
//     return res.status(400).send({
//       message: "Email or password missing."
//     })
//   }
 
//   const {valid, reason, validators} = await isEmailValid(email);
 
//   if (valid) return res.send({message: "OK"});
 
//   return res.status(400).send({
//     message: "Please provide a valid email address.",
//     reason: validators[reason].reason
//   })
 
// });
