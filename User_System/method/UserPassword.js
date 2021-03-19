//test file

const bcrypt = require('bcryptjs')//https://www.npmjs.com/package/bcrypt
const userinput = require('../../User_System/UserSchema').UserSchema;
const securePassword = async () => {
    const password = userinput.password;
    const hashedPassword = await bcrypt.hash(password,8);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    //test
    console.log(password);
    console.log(hashedPassword);
    console.log(isMatch);
}

module.exports = securePassword;