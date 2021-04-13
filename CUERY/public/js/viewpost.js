var postID;
var voteStatus = {};
var originalVoteCount;

function getTimeElapsedString(date) {
    const minute = 60;
    const hour = 60 * 60;
    const day = 60 * 60 * 24;
    const timeElapsed = (Date.now() - date) * 1000; //in seconds
    
    if(timeElapsed < hour) {
        return Math.ceil(timeElapsed / minute) + " minutes ago";
    }
    if(timeElapsed < day) {
        return Math.ceil(timeElapsed / hour) + "hours ago";
    }
    return Math.ceil(timeElapsed / day) + "days ago";
}

const params = new URLSearchParams(window.location.search);
if(params.has("postid")) {
    postID = params.get("postid");
    fetch("/posts/"+params.get("postid"),{method:"GET"})
	.then(res=>res.json())
	.then(data=>{
        document.getElementById("title").innerHTML=data.title;
        document.getElementById("owner").innerHTML= "Posted by " + data.owner;
        document.getElementById("text").innerHTML=data.content;
        document.getElementById("vote_count_post").innerHTML=data.votes;
        originalVoteCount = data.votes;
    })
    .catch(err=>document.getElementById("content").innerHTML="Unable to fetch post :(<br/>"+err);
}
//finding out the voteStatus for the post
fetch("/posts/findVoteOwner/" + postID + "?owner=" + "test_owner2", {method:"GET"})
.then(res => res.json())
.then(result => {
    voteStatus.post = result.status;
    updateStatus("post");
});

async function upvote(target) {
    var url;
    console.log(voteStatus[target]);

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
            body: JSON.stringify({action:"upvote", owner:"test_owner2"})
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
            body: JSON.stringify({action:"cancel", owner:"test_owner2"})
        });
        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"upvote", owner:"test_owner2"})
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
                body: JSON.stringify({action:"cancel", owner:"test_owner2"})
            }
        );
    }
}

        {
            method:"PATCH", 
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
            body: JSON.stringify({action:"downvote", owner:"test_owner2"})
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
            body: JSON.stringify({action:"cancel", owner:"test_owner2"})
        });
        await fetch(url, 
        {
            method:"PATCH", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({action:"downvote", owner:"test_owner2"})
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
                body: JSON.stringify({action:"cancel", owner:"test_owner2"})
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

//populating the comments
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

    //voteBox
    var voteBox = document.createElement("div");
    voteBox.style.display = "flex";
    voteBox.style.width = "5em";
    voteBox.style.float = "left";
    
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
    if(data.votes) voteCount.innerHTML = data.votes;
    else voteCount.innerHTML = "0";
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

    element.appendChild(voteBox);

    //setting voteStatus
    fetch("/comments/findVoteOwner/" + data._id + "?owner=" + "test_owner2", {method:"GET"})
    .then(res => res.json())
    .then(result => {
        voteStatus[data._id] = result.status;
        updateStatus(data._id);
    });

    document.getElementById("comments").appendChild(element);
}

fetch("/comments/children/" + postID, {method:"GET"})
.then(res => res.json())
.then(data => {
    if(data.length) {
        document.getElementById("comments").innerHTML="";
        for(const comment of data) AddCommentToList(comment);
    }
});

function CreateComment() {

    const comment = {
        owner: "bitchass",
        content: document.getElementById("comment_editor_textarea").value,
        parentPost: postID,
        parentComment: ""
    };

    fetch("/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(content)
    })
	.then( function() {
        document.getElementById("comment_editor_textarea").value = "";
        AddCommentToList(comment);
		//window.location.href = "main.html";
	}) 
	.catch(err => console.log(err));
}
        }