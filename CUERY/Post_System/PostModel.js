require('../mongodb/mongoose');
const mongoose = require("mongoose");

//Missing: views

const Post = mongoose.model(
    "Post", {
    owner:{
        type: String,
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true,
        max: 256,
        min: 1
    },
    content: {
        type: String,
        required: true,
        max: 4096,
        min: 1
    },
    category: {
        type: String,
        required: true,
        enum: ["query", "idea", "collaboration", "rant"]
    },
    topic: {
        type: String,
        required: true,
        enum: ["science", "social science", "business", "electronics", "others"]
    },
    status: {
        type: String,
        enum: ["available", "hidden", "draft"],
        default: "available"
    },
    upvotes: {
        type: Number, 
        default: 0
    },
    upvoteOwners: {
        type: [String],
        default: []
    },
    downvotes: {
        type: Number,
        default: 0
    },
    downvoteOwners: {
        type: [String],
        default: []
    },
    comments: { //may be removed since it its not necessary?
        type: [String],
        default: []
    }
});

module.exports = Post;