const mongoose = require("mongoose");

const postCategory = ["query", "idea", "collaboration", "rant"];
const postTopic = ["science", "social science", "business", "electronics", "others"];
const postStatus = ["available", "hidden", "draft", "removed"];

const CommentSchema = mongoose.schema("Comment", {
    id:{
        type: Number,
        required: true
    }, 
    creationDate:{
        type: Date,
        required: true
    },
    owner:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true,
        max: 1000,
        min: 1
    },
    replyComments:{
        type: [Number],
        required: true
    },
    upvote: {
        type: Number, 
        required: true,
        upvoteOwners:{
            type: [String],
            required: true
        }
    },
    downvote: {
        type: Number,
        required: true,
        downvoteOwners:{
            type: [String],
            required: true
        }
    }
});

const PostSchema = mongoose.schema("Post", {
    id:{
        type: Number,
        required: true
    },
    creationDate:{
        type: Date,
        required: true
    },
    owner:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        max: 255,
        min: 1
    },
    content: {
        type: String,
        required: true,
        max: 2000,
        min: 1
    },
    category: {
        type: String,
        required: true,
        validate(value) {
            if(!postCategory.includes(value)) {
                throw new Error("Illegal category!");
            }
        }
    },
    topic: {
        type: String,
        required: true,
        validate(value) {
            if(!postTopic.includes(value)) {
                throw new Error("Illegal topic!");
            }
        }
    },
    upvote: {
        type: Number, 
        required: true,
        upvoteOwners:{
            type: [String],
            required: true
        }
    },
    downvote: {
        type: Number,
        required: true,
        downvoteOwners:{
            type: [String],
            required: true
        }
    },
    status: {
        type: String,
        required: true,
        validate(value) {
            if (!postStatus.includes(value)) {
                throw new Error("Illegal status!");
            }
        }
    }
});

module.exports = {
    CommentSchema: CommentSchema,
    PostSchema: PostSchema
}