require('../mongodb/mongoose');
const PostSchema = require("./PostSchema");

//Missing: views

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;