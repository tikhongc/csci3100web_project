// run node testposts.js to generate test posts

require('./mongodb/mongoose');
const PostModel = require("./Post_System/PostModel.js");
const {categoryList,topicList} = require("./Post_System/PostSchema.js");

const cl = categoryList.length, tl = topicList.length;

for(let i=0;i<cl;++i)for(let j=0;j<tl;++j){
  const newPost = new PostModel({
        owner: "name"+i+j,
        title: "title"+i+j,
        content: "test content"+i+j,
        topic:topicList[j],
        category:categoryList[i]
    });
  try {
      newPost.save();
    } catch(error) {
        throw(error);
    }
}
