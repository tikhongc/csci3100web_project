const mongoose = require("mongoose");
require('../mongodb/mongoose');

const Comment = mongoose.model(
    "Comment", {
    owner:{
        type: String,
        required: true
    },
    parentPost:{
        type: String,
        required: true
    },
    parentComment:{
        type: String,
        default: ""
    }, 
    childrenComments: {
        type: [String],
        default: []
    },
    content: {
        type: String,
        required: true,
        maxLength: 2048,
        minLength: 1
    },
    deleted: {
        type: Boolean,
        default: false
    },
    upvotes: {
        type: Number, 
        default: 0
    },
    upvoteOwners: {
        type: [String],
        default:[]
    },
    downvotes: {
        type: Number,
        default: 0
    },
    downvoteOwners: {
        type: [String],
        default:[]
    },
});

module.exports = Comment;