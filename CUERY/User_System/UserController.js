//file to store and manipulate user data and output a router

require('../mongodb/mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const UserModel = require('./UserModel');
const {WelcomeEmail, RecoveryEmail,ConfirmationEmail} = require('../User_System/method/email');
const authentication=require('../User_System/method/authentication');
const User = new express.Router();     

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
    if (!validateEmail(req.body.newEmail))
          //res.send('error');
        res.redirect('/registration.html?invalid=2');
else{
    try{
         await newUser.save();//save user
         console.log("Created");
        WelcomeEmail(req.body.newEmail, req.body.username);     //send welcome email
        const token = await newUser.Token();        //generate a token for the saved user and send back both toke and user
        res.redirect('/redirection.html');
       //res.send({newUser,token});
    }catch(error){
      res.redirect('/redirection.html');
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
            //user.PasswordReset();
        } 
        const isMatch = await bcrypt.compare(password, user.password);//hash password
        if (!isMatch) {    
          //then compare hashed password with password stored in database
          return res.send('Incorrect password!');
        }
         //const user = await User.login(email, password);//login_authentication
        //reuse token generate 
        const token = await user.Token();
        console.log("Login Successfully.")
        //res.send(currentUser);
        //res.redirect('/main.html');
        res.send({ user, token });  
    }catch(error){
       res.status(400);//bad request
       res.send(error);
    }

})

//logout
User.post('/logout',authentication,async(req,res)=>{
   try{
     //remove token  when log out 
    req.user.tokens = [];
    await req.user.save();       //save user and send back information
    res.send();
   }catch(error){
    res.status(500);//bad request
    res.send(error);
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
       let link = "http://" + req.headers.host + "/api/recovery/reset/" + user.resetPasswordToken;
       console.log(user.resetPasswordToken);
       RecoveryEmail(user.email,user.name,link);
       res.status(200).send('Account activation email has been sent,please check your mailbox.');
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

//get passwordReset
User.get('/reset/:token',async (req, res) => {
    try{
        const user = await UserModel.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}});
        if (!user) {
            return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
         } 
            res.send(user);
    }
    catch(error){
        res.status(400).send(error);
    }
})

//Reset password
User.post('/reset/:token',[
    check('password').not().isEmpty().isLength({min: 8}).withMessage('Must be at least 8 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
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

//update user by id
User.patch('/update',authentication,async(req,res)=>{
    //only allow to update the atrribute included in user model
    const up = Object.keys(req.body);
    const allowupdate=['name','password','year','email','bio','pre',''];//and 
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
         req.user[update]=req.body[update];
        })
        await req.user.save();
        res.status(200);
        res.send(req.user);
    }catch(error){
        res.status(400);//bad request
        res.send(error);
    }
})


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
