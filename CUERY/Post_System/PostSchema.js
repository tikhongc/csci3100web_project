const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
    {
        owner:{
            type: String,
            required: true
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
        },
        controversy: {
            type: Number,
            default: 0
        }
}, {
    timestamps: true
});

PostSchema.pre('save', async function(next) {
    //this is the controversial schema, needs reworking!!
    const post = this;
    if(post.isModified('upvotes') || post.isModified('downvotes')) {
        if(Math.max(post.upvotes, post.downvotes) !== 0) {
            post.controversy = (Math.min(post.upvotes, post.downvotes) / Math.max(post.upvotes, post.downvotes)) * (user.upvotes + user.downvotes);
        }
        else {
            post.controversy = 0;
        }
    }
    next();
});

module.exports = PostSchema;