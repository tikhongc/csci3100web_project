
//code for user input when they sign in


const mongoose = require('mongoose');
require('../mongodb/mongoose');
const validator = require('validator');

const UserSchema= new mongoose.Schema({

    //user name  : 1.no-break space 2.string type 3.min 3 words 4. must input 5.unique
    name: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        minlength: 1,
    },

    //password: 1.8-18 lengths 2.no breakspace 3.hide in html
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
    },

    //user email  : 1.no-break space 2.string type 3.lowercase 4. must input 5.lowercase 6.unique//after connect to database
    email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    year: {
        type: Number,
        maxlength: 1,
        validate(value) {
            if (value < 0) {
                throw new Error('It should be a postive number')
            }
        }
    },
   
    //store token
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    bio: {
        type: String,
        required: false,
        max: 255
    },

    avatar: {
        type: Buffer
    },
   
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    },
    faculty:{
        type: String,
        required: false,
        enum: ["Faculty of Arts","Faculty of Business Administration","Faculty of Education","Faculty of Law","Faculty of Medicine","Faculty of Science","Faculty of Social Science","Faculty of Social Science","Graduate School","Other Academic Units"],
    },
     identity:{
        type: String,
        required: false,
        enum: ["student","professor"]
     },
    // perference:{
       
    // },
}, {timestamps: true});

module.exports = UserSchema;