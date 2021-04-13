var postID;
var postOwner;
var voteStatus = {};
var originalVoteCount;
var username;

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
function AddCommentToList(data) {
    //element
    var element = document.createElement("div");
    element.style.borderLeft = "3px solid rgba(0, 0, 0, .1)";
    element.style.padding = "0.7em";
    element.style.overflow = "auto";

    //owner
    var owner = document.createElement("div");
    owner.innerHTML = data.owner;
    element.appendChild(owner);

    owner.style.fontSize = "10px";
    owner.style.lineHeight = "10px";

    //comment
    var comment = document.createElement("div");
    comment.innerHTML = data.content;
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
        deleteButton.style.border = "transparent";
        deleteButton.setAttribute("id", "delete_button");
        deleteButton.setAttribute("onclick", "deletePostOrComment('" + data._id + "')");
        toolBox.appendChild(deleteButton);
    }

    fetch("/comments/findVoteOwner/" + data._id + "?owner=" + username, {method:"GET"})
    .then(res => res.json())
    .then(result => {
        voteStatus[data._id] = result.status;
        updateStatus(data._id);
    });
    document.getElementById("comments").appendChild(element);
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
        AddCommentToList(commentPosted);
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
    }).then((res) => console.log(res));
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
        document.getElementById("owner").innerHTML= "Posted by " + data.owner;
        postOwner = data.owner;
        document.getElementById("text").innerHTML=data.content;
        document.getElementById("vote_count_post").innerHTML=data.votes;
        originalVoteCount = data.votes;
    })
    .then(() => {
        //fetching username-
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
                            if(!comment.deleted) {
                                AddCommentToList(comment)
                            }
                        };
                    }
                });
            });
        });
    })
    .catch(err=>document.getElementById("content").innerHTML="Unable to fetch post :(<br/>"+err);
}
