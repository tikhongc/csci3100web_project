
//file to connect and listen to  server for user

const express = require('express');
const UserRouter =require('../router/UserRouter');
const app = express();
const port = process.env.PORT || 3000;// nodemon UserServer.js
app.use(express.json())
//registe router
app.use(UserRouter);
app.listen(port,()=>{
    console.log('Serve Starting!'+port);
})