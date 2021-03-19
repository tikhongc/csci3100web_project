//mongo library

const mongodb = require('mongodb');
//Node.js MongoDB Driver API:https://mongodb.github.io/node-mongodb-native/3.6/api/index.html

const MongoClient = require('mongodb').MongoClient;//https://www.npmjs.com/package/mongodb
const assert = require('assert');

//connect database

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'QUERY';

//get object id
const id = new mongodb.ObjectID();
console.log(id);

//user sign in time
time =id.getTimestamp();

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  //User insertion
  db.collection('users').insertOne({
    _id:id,//server side unique id
    CreateDate:time,
    username:'b',
    password:'1',
    year:1,
  },(error,result)=>{
    if(error){
      return console.log('Fail to insert.');
    }
    //print on terminal
    //console.log(result.ops);
  })
   
  //detect the same username or email
  //or use to search the database
  
  //db.collection('users').findOne({username:'a'},(err,user)=>
  //count/count exist number ->db.collection('users').find({username:'a'}).count((err,user)
  db.collection('users').find({username:'b'}).toArray((err,user) => {
    if(err){
     return console.log('NOT FOUND');
 }
      console.log('username exist!');
      //console.log(user);
  })
  
//updateoperator:https://docs.mongodb.com/manual/reference/operator/update/
//update: 1. filter 2. update value it return a promise
  db.collection('users').updateOne({
   _id:'b'
 },{
    $set:{
      name:'kkkk'
    }
 }).then((result)=>{
  console.log(result.modifiedCount);
}).catch((err)=>{
  console.log('Fail to update!');
})

db.collection('user').deleteOne({
   name:'b'
}).then((result) => {
  console.log(result.modifiedCount);
}).catch((error) => {
  console.log('Fail to delete!');
})





 client.close();

})