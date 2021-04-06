require('../mongodb/mongoose');
const authentication=require('../User_System/method/authentication');
const express = require('express');
const PostModel = require("./PostModel");
const CommentModel = require("./CommentModel");
const router = new express.Router();

//Missing: login authentication
//Missing: views

/**
 * The user can:
 * 1. Read a post with an optional filter
 * 2. Retrieve a number of posts with an optional filter
 * 3. Create a post
 * 4. Modify a post of its title, content, category, topic, and status
 * 5. Cast a vote only once or cancel a vote
 * 6. Delete a post
 */

//1. Read a post
router.get('/posts/:id', authentication,async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if(!post) {
            return res.status(404).send();
        }
        res.send(post);
    } catch(error) {
        res.status(500).send(error);
    }
});

//2. Retrieve a number of posts before a timestamp with an optional filter
router.get('/posts/before/:createdAt/limit/:limit/sort/:sort', async (req, res) => {
    const filters = Object.keys(req.body);
    const allowedFilters = ["category", "topic"];
    const isValidOperation = filters.every((filter) => allowedFilters.includes(filter));
    
    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid filters." });
    }

    if(!["timeAsc", "timeDes", "upvoDes", "downDes", "contDes"].includes(req.sort)) {
        return res.status(400).send({ error: "Invalid sort." });
    }

    var sort;

    switch(req.sort) {
        case "timeAsc":
            sort = "+createdAt";
            break;
        case "timeDes":
            sort = "-createdAt";
            break;
        case "upvoDes":
            sort = "+upvotes";
            break;
        case "downDes":
            sort = "-upvotes";
            break;
        case "contDsc":
            sort = "-controversy";
            break;
    }

    try {
        const posts = await PostModel.find({
            $and: [
                req.body,
                {
                    createdAt: { $lt: req.params.createdAt }
                }
            ]
        }).limit(parseInt(req.params.limit)).sort(sort);

        res.send(posts);
    }
    catch(error) {
        res.status(500).send(error);
    }
});

//2. Create a post
router.post('/posts',authentication,async (req, res) => {
    const newPost = new PostModel(req.body);
    try {
        await newPost.save();
        res.status(201).send(newPost);
    } catch(error) {
        res.status(400).send(error);
    }
});

//3. Modify a post of its title, content, category, topic, and status
router.patch('/posts/:id',authentication,async (req, res) => {
    //Validating legitimacy of the update request
    updates = Object.keys(req.body);
    allowedUpdates = ["title", "content", "category", "topic", "status"];
    isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: "Invalid update."});
    }

    try {
        const post = await PostModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!post) { //No post found
            return res.status(404).send();
        }
        res.send(post);
    } catch(error) {
        res.status(500).send();
    }
});

//4. Cast a vote only once or cancel a vote
//The request body must use a vote object
/**
 *   An example vote object:
 *   {
 *       "owner": "username",
 *       "action": "upvote" (this can be "upvote", "doownvote", or "cancel")
 *   }
 */
router.patch('/posts/vote/:id',authentication, async (req, res) => {
    const {owner, action} = req.body;

    try {
        //checking if the post exists
        const post = await PostModel.findById(req.params.id);
        if(!post) {
            return res.status(404).send();
        }
        //cancelling a vote
        if(action === "cancel") {
            if(post.upvoteOwners.includes(owner) || post.downvoteOwners.includes(owner)) {
                //checking if the voter has an upvote or not
                const isUpvote = post.upvoteOwners.includes(owner);
                if(isUpvote) {
                    try {
                        //await post.update({ $pull: { upvoteOwners: owner }, $inc: { upvotes: -1 }});
                        post.upvoteOwners.splice(post.upvoteOwners.indexOf(owner), 1);
                        post.upvotes -= 1;
                        await post.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send();
                    } 
                }
                else {
                    try {
                        post.downvoteOwners.splice(post.downvoteOwners.indexOf(owner), 1);
                        post.downvotes -= 1;
                        await post.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send();
                    } 
                }
            }
            return res.status(404).send({ error: "No owner found." });
        }
        //voting
        else if(action === "upvote" || action === "downvote") {
            //checking if the owner has already voted
            const alreadyVoted = post.upvoteOwners.includes(owner) || post.downvoteOwners.includes(owner);

            if(alreadyVoted) {
                //warning the client that the owner has already voted
                return res.status(400).send({error: "The owner has already casted a vote. Cancel the vote first."});
            }
            else {
                //handling an upvote
                if(action === "upvote") {
                    try {
                        post.upvoteOwners.push(owner);
                        post.upvotes += 1;
                        await post.save();

                        //await post.update({ $addToSet: { upvoteOwners: owner }, $inc: { upvotes: 1 } });
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send(error);
                    }
                }
                //handling a downvote
                else {
                    try{
                        post.downvoteOwners.push(owner);
                        post.downvotes += 1;
                        await post.save();

                        //await post.update({ $addToSet: { downvoteOwners: owner }, $inc: { downvotes: 1 } });
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send(error);
                    }
                }
            }
        }
        else return res.status(400).send({ error: "Invalid action. (Use cancel, upvote, or downvote)" });
    } catch(error) {
        return res.status(500).send(error);
    }
});

//5. Delete a post
router.delete('/posts/:id',authentication, async (req, res) => {
    try {
        const post = await PostModel.findByIdAndDelete(req.params.id);
        if(!post) {
            return res.status(404).send();
        }
        await CommentModel.deleteMany( {parentPost: req.params.id });
        res.send(post);
    } catch(error) {
        res.status(500).send(error);
    }
});

module.exports = router;