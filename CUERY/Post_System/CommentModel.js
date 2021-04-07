const CommentSchema = require("./CommentSchema");
require('../mongodb/mongoose');

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;