var postID;
var postOwner;
var voteStatus = {};
var username;
var openedReplybox;

//function definitions
async function upvote(target) {
    var url;

    if(target === "post") {
        url = "/posts/vote/" + postID;
    }
    else {
        url = "/comments/vote/" + target;
    }

    if(voteStatus[target] === "none") {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) + 1).toString();
        voteStatus[target] = "upvote";
        updateStatus(target);

        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"upvote", owner: username})
        });
    }
    else if (voteStatus[target] === "downvote") {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) + 2).toString();
        voteStatus[target] = "upvote";
        updateStatus(target);

        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"cancel", owner: username})
        });
        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"upvote", owner: username})
        });
    }
    else {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) - 1).toString();
        voteStatus[target] = "none";
        updateStatus(target);
        
        await fetch(url, 
            {
                method:"PATCH", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action:"cancel", owner: username})
            }
        );
    }
}

async function downvote(target) {
    var url;

    if(target === "post") {
        url = "/posts/vote/" + postID;
    }
    else {
        url = "/comments/vote/" + target;
    }

    if(voteStatus[target] === "none") {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) - 1).toString();
        voteStatus[target] = "downvote";
        updateStatus(target);

        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"downvote", owner: username})
        });
    }
    else if (voteStatus[target] === "upvote") {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) - 2).toString();
        voteStatus[target] = "downvote";
        updateStatus(target);

        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"cancel", owner: username})
        });
        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"downvote", owner: username})
        });
    }
    else {
        document.getElementById("vote_count_" + target).innerHTML = (parseInt(document.getElementById("vote_count_" + target).innerHTML) + 1).toString();
        voteStatus[target] = "none";
        updateStatus(target);
        
        await fetch(url, 
            {
                method:"PATCH", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action:"cancel", owner: username})
            }
        );
    }
}

function updateStatus(target) {
    switch(voteStatus[target]) {
        case "upvote":
            document.getElementById("upvote_button_" + target).style.backgroundImage = "url('../img/up_active.png')";
            document.getElementById("downvote_button_" + target).style.backgroundImage = "url('../img/down_inactive.png')";
            break;
        case "downvote":
            document.getElementById("upvote_button_" + target).style.backgroundImage = "url('../img/up_inactive.png')";
            document.getElementById("downvote_button_" + target).style.backgroundImage = "url('../img/down_active.png')";
            break;
        case "none":
            document.getElementById("upvote_button_" + target).style.backgroundImage = "url('../img/up_inactive.png')";
            document.getElementById("downvote_button_" + target).style.backgroundImage = "url('../img/down_inactive.png')";
            break;
    }
}

//add one comment to list
function addCommentToList(data, indentation, depth) {
    if(!depth) depth = 1;

    var element;
    
    //element
    element = document.createElement("div");
    element.setAttribute("data-depth", depth.toString());
    element.setAttribute("id", "comment_" + data._id);
    element.style.borderLeft = "3px solid rgba(0, 0, 0, .1)";
    element.style.paddingLeft = "0.7em";
    element.style.marginLeft = indentation + "em";
    element.style.overflow = "auto";
    if(indentation === 0) element.style.marginBottom = "1em";
    else element.style.marginTop = "1em";

    //owner
    var owner = document.createElement("div");
    owner.innerHTML = data.owner + " " + getTimeElapsedString(new Date(data.createdAt));
    element.appendChild(owner);
    owner.style.fontSize = "10px";
    owner.style.lineHeight = "10px";

    //comment
    var comment = document.createElement("div");
    comment.setAttribute("id", "comment_content_" + data._id);
    if(!data.deleted) comment.innerHTML = data.content;
    else comment.innerHTML = "<span style='color: rgb(73, 164, 233);'>[COMMENT DELETED BY USER]</span>";
    element.appendChild(comment);

    //toolBox
    var toolBox = document.createElement("div");
    toolBox.style.width = "100%";
    toolBox.style.overflow = "hidden";
    element.appendChild(toolBox);

    //voteBox
    var voteBox = document.createElement("div");
    voteBox.style.display = "flex";
    voteBox.style.width = "5em";
    voteBox.style.float = "left";
    toolBox.appendChild(voteBox);

    //upvoteButton
    var upvoteButton = document.createElement("button");
    upvoteButton.style.backgroundImage = "url(../img/up_inactive.png)";
	upvoteButton.style.backgroundRepeat = "no-repeat";
	upvoteButton.style.backgroundPosition = "center";
	upvoteButton.style.height = "20px"; 
    upvoteButton.style.width = "20px";
    upvoteButton.setAttribute("class", "vote_button upvote_button");
    upvoteButton.setAttribute("id", "upvote_button_" + data._id);
    upvoteButton.setAttribute("onclick", "upvote('" + data._id + "')");
    voteBox.appendChild(upvoteButton);

    //voteCount
    var voteCount = document.createElement("div");
    voteCount.innerHTML = data.votes;
    voteCount.style.width = "3em";
    voteCount.style.lineHeight = "20px";
    voteCount.style.textAlign = "center";
    voteCount.setAttribute("id", "vote_count_" + data._id);
    voteBox.appendChild(voteCount);

    //downvoteButton
    var downvoteButton = document.createElement("button");
    downvoteButton.style.backgroundImage = "url(../img/down_inactive.png)";
	downvoteButton.style.backgroundRepeat = "no-repeat";
	downvoteButton.style.backgroundPosition = "center";
	downvoteButton.style.height = "20px"; 
    downvoteButton.style.width = "20px";
    downvoteButton.setAttribute("class", "vote_button downvote_button");
    downvoteButton.setAttribute("id", "downvote_button_" + data._id);
    downvoteButton.setAttribute("onclick", "downvote('" + data._id + "')");
    voteBox.appendChild(downvoteButton);

    //deleteButton
    if(username === data.owner) {
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "delete comment";
        deleteButton.style.float = "right";
        deleteButton.style.height = "2em";
        deleteButton.style.fontSize = "11px";
        deleteButton.style.lineHeight = "5px";
        deleteButton.style.marginLeft = "1em";
        deleteButton.style.border = "transparent";
        deleteButton.setAttribute("id", "delete_button");
        deleteButton.setAttribute("onclick", "deletePostOrComment('" + data._id + "')");
        toolBox.appendChild(deleteButton);
    }

    //display reply button
    if(depth < 10) {
        var replyButton = document.createElement("button");
        replyButton.innerHTML = "reply";
        replyButton.style.float = "right";
        replyButton.style.height = "2em";
        replyButton.style.fontSize = "11px";
        replyButton.style.lineHeight = "5px";
        replyButton.style.border = "transparent";
        replyButton.setAttribute("id", "display_reply_button_" + data._id);
        replyButton.setAttribute("onclick", "displayReply('" + data._id + "')");
        toolBox.appendChild(replyButton);
    }

    //reply box
    var replyBox = document.createElement("div");
    replyBox.setAttribute("id", "reply_box_" + data._id);
    replyBox.style.padding = "0";
    replyBox.style.display = "none";
    element.appendChild(replyBox);

    //reply textarea
    var replyTextarea = document.createElement("textarea");
    replyTextarea.setAttribute("id", "reply_textarea_" + data._id);
    replyTextarea.setAttribute("rows", "2");
    replyTextarea.setAttribute("placeholder", "Write your comment here...");

    replyTextarea.style.padding = "0.5em";
    replyTextarea.style.lineHeight = "1.5em";
    replyTextarea.style.float = "bottom";
    replyTextarea.style.width = "100%";
    replyTextarea.style.marginTop = "0.5em";
    replyTextarea.style.marginBottom = "0.5em";
    replyTextarea.style.resize = "none";
    replyTextarea.style.display = "block";
    replyTextarea.style.backgroundColor = "rgb(255, 255, 255)";
    replyTextarea.style.border = "0.1em solid #a4d3f1";
    replyTextarea.style.borderRadius = "5px";
    replyBox.appendChild(replyTextarea);

    //reply toolbox
    var replyToolBox = document.createElement("div");
    replyToolBox.style.width = "100%";
    replyToolBox.style.overflow = "hidden";
    replyBox.appendChild(replyToolBox);

    //submit reply button
    var submitReplyButton = document.createElement("button");
    submitReplyButton.innerHTML = "submit";
    submitReplyButton.style.float = "right";
    submitReplyButton.style.height = "2em";
    submitReplyButton.style.fontSize = "11px";
    submitReplyButton.style.lineHeight = "5px";
    submitReplyButton.style.border = "transparent";
    submitReplyButton.setAttribute("id", "submit_reply_button");
    submitReplyButton.setAttribute("onclick", "replyComment('" + data._id + "')");
    replyToolBox.appendChild(submitReplyButton);

    //children comments box
    var childrenBox = document.createElement("div");
    childrenBox.setAttribute("id", "children_box_" + data._id);
    element.appendChild(childrenBox);

    //populating children box
    fetch("/comments/children/" + data._id, {method:"GET"})
    .then(res => res.json())
    .then(children => {
        if(children.length) {
            for(const comment of children) {
                childrenBox.appendChild(addCommentToList(comment, 0.5, depth + 1));
            };
        }
    });

    //initializing vote buttons
    fetch("/comments/findVoteOwner/" + data._id + "?owner=" + username, {method:"GET"})
    .then(res => res.json())
    .then(result => {
        voteStatus[data._id] = result.status;
        updateStatus(data._id);
    });

    return element;
}

function createNewComment() {
    const comment = {
        owner: username,
        content: document.getElementById("comment_editor_textarea").value,
        parentPost: postID,
        parentComment: ""
    };
    fetch("/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(comment)
    })
    .then(res => res.json())
	.then((commentPosted) => {
        document.getElementById("comment_editor_textarea").value = "";
        const element = addCommentToList(commentPosted, 0);
        document.getElementById("comments").appendChild(element);
        element.scrollIntoView(
            {
                behavior: "smooth",
                block: "start",
                inline: "nearest"
            }
        );
	})
	.catch(err => console.log(err));
}

function deletePostOrComment(target) {
    var url
    if(target === "post") {
        url = "/posts/" + postID;
    }
    else {
        url = "/comments/" + target;
    }
    fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => {
        if(target !== "post") {
            document.getElementById("comment_content_" + target).innerHTML = "<span style='color: rgb(73, 164, 233);'>[COMMENT DELETED BY USER]</span>"
        }
        else {
            alert("Post successfully deleted.");
            window.location.href = "main.html";
        }
    });
}

function displayReply(target) {
    const button = "display_reply_button_" + target;
    const replybox = "reply_box_" + target;
    const replyTextarea = "reply_textarea_" + target; 

    if(document.getElementById(replybox).style.display === "none") {
        if(openedReplybox) displayReply(openedReplybox);
        document.getElementById(button).innerHTML = "close";
        document.getElementById(replybox).style.display = "block";
        document.getElementById(replyTextarea).focus();
        openedReplybox = target;
    }
    else {
        document.getElementById(button).innerHTML = "reply";
        document.getElementById(replybox).style.display = "none";
        openedReplybox = "";
    }
}

function replyComment(target) {
    const content = document.getElementById("reply_textarea_" + target).value;

    const newComment = {
        owner: username,
        parentPost: postID,
        parentComment: target,
        content: content
    }

    fetch("/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newComment)
    }).then(res => res.json())
    .then(res => {
        document.getElementById("reply_textarea_" + target).value = ""
        displayReply(target); //closing the reply textarea
        const element = addCommentToList(res, 0.5, parseInt(document.getElementById("comment_" + target).dataset.depth) + 1);
        document.getElementById("children_box_" + target).appendChild(element);
        element.scrollIntoView(
            {
                behavior: "smooth",
                block: "center",
                inline: "center"
            }
        );
    })
}

//getting all the data for the page
//getting post data
const params = new URLSearchParams(window.location.search);
if(params.has("postid")) {
    postID = params.get("postid");
    fetch("/posts/"+params.get("postid"),{method:"GET"})
	.then(res=>res.json())
	.then(data=>{
        document.getElementById("title").innerHTML=data.title;
        document.getElementById("owner").innerHTML= "Posted by " + data.owner + " " + getTimeElapsedString(new Date(data.createdAt));
        postOwner = data.owner;
        document.getElementById("text").innerHTML=data.content;
        document.getElementById("vote_count_post").innerHTML=data.votes;
        document.getElementById("category").innerHTML = toTitleCase(data.category);
        document.getElementById("topic").innerHTML = toTitleCase(data.topic);
    })
    .then(() => {
        //fetching username
        fetch('/checkCookie', options).then(res => res.json())
        .then(data=> {
            if (data.answer === 'NA'){
                alert("Please login first: )");
                window.location.href = "login.html";
            }
            else{
                username = data.name;
                //putting a delete button if the user owns the post
                if(postOwner === username) {
                    var button = document.createElement("button");
                    button.setAttribute("onclick", "deletePostOrComment('post')")
                    button.innerHTML = "delete post";
                    button.style.float = "right";
                    document.getElementById("contentbox").appendChild(button);
                }
            }
        })
        .then(() => {
            //finding out the voteStatus for the post
            fetch("/posts/findVoteOwner/" + postID + "?owner=" + username, {method:"GET"})
            .then(res => res.json())
            .then(result => {
                voteStatus.post = result.status;
                updateStatus("post");
            })
            .then(() => {
                fetch("/comments/children/" + postID, {method:"GET"})
                .then(res => res.json())
                .then(data => {
                    if(data.length) {
                        document.getElementById("comments").innerHTML="";
                        for(const comment of data) {
                            document.getElementById("comments").appendChild(addCommentToList(comment, 0));
                        };
                    }
                });
            });
        });
    })
    .catch(err=>document.getElementById("content").innerHTML="Unable to fetch post :(<br/>"+err);
}
