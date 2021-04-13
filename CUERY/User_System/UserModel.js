

//file for :
//contain methods for schema:
//1.hash password and save
//2.add authentication token
//3.match user by email and password when they log in
//4.hide private data of user
//5.save schema as model and return a user model
//6.create relationship between user and post

const UserSchema = require('./UserSchema');
const bcrypt = require('bcryptjs');//https://www.npmjs.com/package/bcrypt
const jwt = require('jsonwebtoken');//https://www.npmjs.com/package/jsonwebtoken
const crypto = require('crypto');
//User Methods:

//function for hide private user data

UserSchema .methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  //delete userObject.password;
  //delete userObject.tokens;
  //delete userObject._id;
  //delete userObject.createdAt;
  //delete userObject.updatedAt;
  //delete userObject.timestamps;
  return userObject;
}

UserSchema .methods.Token = async function(){
      const user = this;
       //create token->assign user id , sign token value ->use jsonwebtoken.sign function
      user._id=""+user._id;
      const token = jwt.sign({ _id: user._id},  "" + process.env.JWT_KEY);
      user.tokens = user.tokens.concat({ token });     
       //console.log(token);
      await user.save(); //save user
      return token;  //return token

}

//reset password,create resetPasswordToken and resetPasswordExpires
UserSchema .methods.ResetPassword = async function() {
    const user = this;
    const JWT_SECRET = 'somee super screcet...';
const secret = JWT_SECRET + user.password;
const playload = {
    email:user.eamil,
    id:user._id
}
this.resetPasswordToken = jwt.sign(playload, secret,{expiresIn:'3600000s'});
user._id=""+user._id;
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
    await user.save(); //save user
};

//Adding Virtua-Relationship:
//create relationship between user \ post \ comment

UserSchema .virtual('Post', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema .virtual('Comment', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'owner'
})

//hash password before saving userinput and call next when we are done
UserSchema .pre('save',async function(next){
    const user = this;
    if(user.isModified('password')){        //true when user is being updated
       user.password = await bcrypt.hash(user.password,8);        //ensure the sucrity of user 's password
    }
    next();
 })


const  User= mongoose.model('User', UserSchema );

module.exports = User;
