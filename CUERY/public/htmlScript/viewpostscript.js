var postID;
var voteStatus;
var originalVoteCount;

const params = new URLSearchParams(window.location.search);
if(params.has("postid")) {
        postID = params.get("postid");
        fetch("/posts/"+params.get("postid"),{method:"GET"})
    .then(res=>res.json())
    .then(data=>{
        document.getElementById("title").innerHTML=data.title;
        document.getElementById("owner").innerHTML= "Posted by " + data.owner;
        document.getElementById("text").innerHTML=data.content;
        document.getElementById("vote_count").innerHTML=data.votes;
        originalVoteCount = data.votes;
    })
    .catch(err=>document.getElementById("content").innerHTML="Unable to fetch post :(<br/>"+err);
}
fetch("/posts/findVoteOwner/" + postID + "?owner=" + "test_owner2", {method:"GET"})
.then(res => res.json())
.then(data => {
    voteStatus = data.status;
    updateStatus();
});

async function upvote() {
    if(voteStatus === "none") {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) + 1).toString();
        voteStatus = "upvote";
        updateStatus();
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"upvote", owner:"test_owner2"})
        });
    }
    else if (voteStatus === "downvote") {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) + 2).toString();
        voteStatus = "upvote";
        updateStatus();
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"cancel", owner:"test_owner2"})
        });
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"upvote", owner:"test_owner2"})
        });
    }
    else {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) - 1).toString();
        voteStatus = "none";
        updateStatus();
        
        await fetch("/posts/vote/" + postID, 
            {
                method:"PATCH", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action:"cancel", owner:"test_owner2"})
            }
        );
    }
}

async function downvote() {
    if(voteStatus === "none") {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) - 1).toString();
        voteStatus = "downvote";
        updateStatus();
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"downvote", owner:"test_owner2"})
        });
    }
    else if (voteStatus === "upvote") {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) - 2).toString();
        voteStatus = "downvote";
        updateStatus();
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"cancel", owner:"test_owner2"})
        });
        await fetch("/posts/vote/" + postID, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"downvote", owner:"test_owner2"})
        });
    }
    else {
        document.getElementById("vote_count").innerHTML = (parseInt(document.getElementById("vote_count").innerHTML) + 1).toString();
        voteStatus = "none";
        updateStatus();
        
        await fetch("/posts/vote/" + postID, 
            {
                method:"PATCH", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action:"cancel", owner:"test_owner2"})
            }
        );
    }
}

function updateStatus() {
    switch(voteStatus) {
        case "upvote":
            document.getElementById("upvote_button").style.backgroundImage = "url('../img/up_active.png')";
            document.getElementById("downvote_button").style.backgroundImage = "url('../img/down_inactive.png')";
            break;
        case "downvote":
            document.getElementById("upvote_button").style.backgroundImage = "url('../img/up_inactive.png')";
            document.getElementById("downvote_button").style.backgroundImage = "url('../img/down_active.png')";
            break;
        case "none":
            document.getElementById("upvote_button").style.backgroundImage = "url('../img/up_inactive.png')";
            document.getElementById("downvote_button").style.backgroundImage = "url('../img/down_inactive.png')";
            break;
    }
}

function AddCommentToList(data) {
    var comment = document.createElement("div");
    comment.style.borderLeft = "3px solid rgba(0, 0, 0, .1)";
    comment.style.height = "40px";
    document.getElementById("comments").appendChild(comment);
}

AddCommentToList({});
AddCommentToList({});
AddCommentToList({});