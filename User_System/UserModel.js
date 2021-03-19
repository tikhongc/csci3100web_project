

//file for :
//contain methods for schema:
//1.hash password and save
//2.add authentication token
//3.match user by email and password when they log in
//4.hide private data of user
//5.save schema as model and return a user model
//6.create relationship between user and post

const User = require('./UserSchema');
const bcrypt = require('bcryptjs');//https://www.npmjs.com/package/bcrypt
const crypto = require('crypto-js');//https://www.npmjs.com/package/crypto-js
const jsonwebtoken = require('jsonwebtoken');//https://www.npmjs.com/package/jsonwebtoken


//hash password before saving userinput and call next when we are done
//run some codes do sth before user is saved
User.pre('save',async function(next){
   const user = this;
   //true when user is being updated
   if(user.isModified('password')){
       //ensure the sucrity of user 's password
      user.password = await bcrypt.hash(user.password,8);
   }
   next();
})

//function for hide private user data
//1.password 2.tokens  and others ?
User.methods.publicData = function(){
    //use delete function here
//remove user data and then user will not see it
//return user information
}

User.methods.authenticationToken = async function(){
      //const user
      //create token->assign user id , sign token value ->use jsonwebtoken.sign function
      //save user
      //return token
}

UserSchema.methods.generatePasswordReset = function() {
    const user = this;
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

User.statics.findByCredentials = async (email,password)=>{
    //find user by email and stored as a const
    //if error:not user be found
    //then compare hashed password with password stored in database
    const matching = await bcrypt.compare(password,user.password);

    if(!matching){
        //error
    }

    //return user information
}

//create relationship between user and post
User.virtual('post',{
    ref:'Post',
    localFiedl:'_id',
    foreignField:'', //ref stored in Post schema
})

//綱要Schemas被mongoose.model()方法“編譯”為模型。擁有模型後，您可以使用它來查找，創建，更新和刪除給定類型的對象。
//model 用來封裝 schema
const  UserModel= mongoose.model('User', User);

// Test :connect to database and postman successfully
  const newuser = new UserModel({
     name: 'chiutikhong',
     email: '120343232@gmail.com  ',
     password: '12312314',
     year:3,
  })
  //save user
 newuser.save().then(() => {
      console.log(newuser)
  }).catch((error) => {
      console.log('Error!')
  })

module.exports.UserModel = UserModel;
