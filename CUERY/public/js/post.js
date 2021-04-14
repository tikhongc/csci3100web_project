/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//timeStamp will be of type Date
function getTimeElapsedString(timeStamp) {
	const minute = 1000 * 60;
	const hour = 1000 * 60 * 60;
	const day = 1000 * 60 * 60 * 24;
    const now = new Date(Date.now());
	const timeElapsed = Date.now() - timeStamp;

	if(timeElapsed < minute) return "just now";
	if(timeElapsed < hour) {
		const temp = Math.floor(timeElapsed / minute);
		if(temp === 1) return temp + " minute ago";
		return temp + " minutes ago";
	}
    if(timeElapsed < day) {
		const temp = Math.floor(timeElapsed / hour);
		if(temp === 1) return temp + " hour ago";
		return temp + " hours ago";
	}
    if(timeElapsed < day * 30) {
		const temp = Math.floor(timeElapsed / day);
		if(temp === 1) return temp + "day ago";
		return temp + " days ago";
	}
    if(timeElapsed < day * 365) {
		const temp = (now.getMonth() - timeStamp.getMonth());
		if(temp === 1) return temp + " month ago";
		return temp + " months ago";
	} 
	const temp = (now.getFullYear() - timeStamp.getFullYear());
	if(temp === 1) return temp + " year ago";
    return  temp + " years ago";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var userCookie = getCookie("x-access-token");

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({userCookie})
};
        
var user;
// check the user's cookie before loading information
function userAuthentication() {
fetch('/checkCookie', options).then(res=>res.json())
.then(data=>{
    if (data.answer === 'NA'){
        alert("Please login first : )");
        window.location.href = "login.html";
    }
    else{   // continue loading if user are verified,  can use the user object received in the response
        console.log(data);
        document.getElementById("useravatar").src = "data:image/png;base64," + data.avatar.data;
        document.getElementById("sidebar-avatar").src = "data:image/png;base64," + data.avatar.data;
        document.getElementById("sidebar-username").innerHTML = data.name;
        document.getElementById("sidebar-email").innerHTML = "(" + data.email + ")";
        document.getElementById("sidebar-year").innerHTML = "Year: " + data.year;

        const options2 = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({data})
		};
		console.log(data._id);
		fetch("/user/posts/"+data._id,{options2})
		.then(res=>res.json())
		.then(data=>{
			let counter = 0;
			for (let i = 0; i < data.length; i++) 
			counter++;
			document.getElementById("sidebar-postnum").innerHTML = "Total Posts: " + counter;	
		})	
        
        /*
        // fetch topics and categories
	fetch("/lists/topic",{method:"GET"})
	.then(res=>res.json())
	.then(data=>{
		var option,select=document.getElementById("topic");
		for(const topic of data){
			option=document.createElement("option");
			option.value=topic;
			option.innerHTML=toTitleCase(topic);
			select.appendChild(option);
		}
		return fetch("/lists/category",{method:"GET"});})
	.then(res=>res.json())
	.then(data=>{
		var option,select=document.getElementById("category");
		for(const category of data){
			option=document.createElement("option");
			option.value=category;
			option.innerHTML=toTitleCase(category);
			select.appendChild(option);
		}
	})
	.catch(err=>console.log("Error: unable to fetch information.\n",err));
        
	ReloadPosts();
        */
    }
});
}
        
function toTitleCase(str) {
	var arr=str.split(" "),i=0;
	for(const word of arr)arr[i++]=word[0].toUpperCase()+word.slice(1,word.length);
	return arr.join(" ");
}

   function Post_profile() {
	fetch('/checkCookie', options).then(res=>res.json())
	.then(data=>{
		if (data.answer === 'NA'){
			alert("Please login first : )");
			window.location.href = "login.html";
		}
		else{   
			const options2 = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({data})
			};
			console.log(data._id);
			fetch("/user/posts/"+data._id,{options2})
			.then(res=>res.json())
			.then(data=>{
			   document.getElementById("posts").innerHTML="";
			   for(const post of data)AddPost(post);
			})
		}
	});
 }           
function ViewPost(postid) {window.location="/viewpost.html?postid="+postid;}
function AddPost(data) { // data is an object
	var post=document.createElement("div");
	post.style.whiteSpace = "nowrap";
	post.style.overflow = "hidden";

	var p=document.createElement("p");
	var obj=document.createElement("div");
	if(data.votes === 0) colorValue = "grey";
	else if(data.votes < 0) colorValue = "rgb(255, 65, 65)";
	else colorValue = "rgb(34, 160, 255)";
	var voteCount;
	if(Math.abs(data.votes) > 1000) {
		voteCount = (Math.floor(data.votes / 100) / 10).toString() + "k";
	}
	else voteCount = data.votes.toString();
	p.innerHTML = "<span style='color: " + colorValue + ";'>" + voteCount + "</span>";
	p.style.width = "3em";
	p.style.textAlign = "center";
	p.style.margin = "0 auto";
	p.style.marginRight = "0.2em";
	p.style.fontSize="200%";
	post.appendChild(p);

	p=document.createElement("p");
	obj.innerHTML=data.title;
	obj.style.marginBottom = "0.4em";
	p.appendChild(obj);

	obj=document.createElement("div");
	obj.classList.add("text-secondary");
	//parsing date
	const date = new Date(data.createdAt);
	var dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

	//adding category tag
	category = document.createElement("div");
	category.setAttribute("class", "tag");
	category.setAttribute("id", "category_" + data._id);
	category.innerHTML = toTitleCase(data.category);
	category.style.marginRight = "0.5em";
	obj.appendChild(category);

	//adding topic tag
	topic = document.createElement("div");
	topic.setAttribute("class", "tag");
	topic.setAttribute("id", "topic_" + data._id);
	topic.innerHTML = toTitleCase(data.topic);
	topic.style.marginRight = "0.5em";
	obj.appendChild(topic);

	//owner
	obj.insertAdjacentHTML("beforeend", "by " + data.owner + " on " + dateString);

	obj.style.fontSize = "10px";
	p.appendChild(obj);
	post.appendChild(p);
	post.setAttribute("onclick","ViewPost('"+data._id+"');");
	document.getElementById("posts").appendChild(post);
	// can add more information
}
                /*
		// test function
		// addPost({title:"foo",owner:"bar",upvotes:123,downvotes:24});
		
			// add posts if scroll reaches bottom
			window.addEventListener("scroll",function(e){
				const scroll = (window.scrollY/(document.body.clientHeight-window.innerHeight));
				console.log(scroll);
				if(scroll>0.9){ // threshold: 90% scroll
					console.log("threshold-reached");
					// do something
				}
			});
		*/
function ReloadPosts(keepPage) {
	// erase all previous posts and disable page changing
	document.getElementById("posts").innerHTML="Loading...";
	document.getElementById("pages").innerHTML="&nbsp;1";
	if(!keepPage)history.pushState({page:1},"page 1","?page=1");
	
	const query = new URLSearchParams(window.location.search);
	const page=(keepPage&&query.has("page"))?query.get("page"):"1";
	const limit=10; // temporary value
	const category=document.getElementById("category").value;
	const topic=document.getElementById("topic").value;
	const sort=document.getElementById("sort").value;
	fetch("/posts?page="+page+"&limit="+limit+"&category="+category+"&topic="+topic+"&sort="+sort,{method:"GET"})
	.then(res=>res.json())
	.then(data=>{
		if(data.length){
			document.getElementById("posts").innerHTML="";
			for(const post of data)AddPost(post);
			return fetch("/count?category="+category+"&topic="+topic,{method:"GET"});
		} else document.getElementById("posts").innerHTML="No posts found :(";
	})
	.then(res=>res.text())
	.then(count=>{
		document.getElementById("pages").innerHTML="";
		var p,pages=document.getElementById("pages");
		const pageCnt=Math.ceil(count/limit);
		for(let i=1;i<=pageCnt;++i){
			p=document.createElement("p");
			p.innerHTML=i;
			p.addEventListener("click",()=>{
				history.pushState({page:i},"page "+i,"?page="+i);
				ReloadPosts(true);
			});
			pages.appendChild(p);
		}
	})
	.catch(err=>console.log("Error: unable to fetch posts and/or pages.\n",err));
}

function Logout(){
    const option = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({userCookie})
    };
    
    fetch('/logout', {method: 'POST'}).then(res=>res.json())
    .then(data=>{
        if (data.note === "success"){
            document.cookie = "x-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // ckear the cookies
            alert("You have successfully logged out.")
            window.location.href = "login.html";
        }
    }).catch(err=>{
        console.log(err);
    });
}

function toProfile(){
    window.location.href = "user.html";
}

function toMain(){
    window.location.href = "main.html";
}

function toPost(){
    window.location.href = "post-profile.html";
}
        
function toggleSidebar(){
    document.getElementById('sidebar').classList.toggle('sidebar-visible'); 
    document.getElementById('useravatar').classList.toggle('useravatar-visible');
}

function CreatePost() {
	var data = {
		title:document.getElementById("title").value,
		category:document.getElementById("category").value,
		topic:document.getElementById("topic").value,
		content:document.getElementById("newcontent").value
	};
		const options = {
        method: 'POST',
            headers: 
			{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
        };
	fetch("/posts",options)
	//.then(res=>res.json())
	.then(res=>{
		alert('Post creation success !');
		window.location.href = "main.html";
	})
	.catch(err=>console.log(err));
}
function FetchLists() { // fetch topics and categories
	fetch("/lists/topic",{method:"GET"})
	.then(res=>res.json())
	.then(data=>{
		var option,select=document.getElementById("topic");
		for(const topic of data){
			option=document.createElement("option");
			option.value=topic;
			option.innerHTML=toTitleCase(topic);
			select.appendChild(option);
		}
		return fetch("/lists/category",{method:"GET"})})
	.then(res=>res.json())
	.then(data=>{
		var option,select=document.getElementById("category");
		for(const category of data){
			option=document.createElement("option");
			option.value=category;
			option.innerHTML=toTitleCase(category);
			select.appendChild(option);
		}
	})
	.catch(err=>console.log("Error: unable to fetch information.\n",err));
}
function FetchHeader() {
	fetch("../header.html")
	.then(res=>res.text())
	.then(txt=>document.getElementById("header").innerHTML=txt)
	.catch(err=>console.log("Unable to fetch header.\n",err));
}

function updateUser(){
    window.location.href = "userupdate.html";
}

function checkUserUpdate(){
    let email = document.getElementById("email").value;
    let name = document.getElementById("name").value;
    let oldpw = document.getElementById("oldpw").value;
    let pw1 = document.getElementById("password").value;
    let pw2 = document.getElementById("newpw2").value;
			
    if (oldpw.length === 0){
        alert("Old password is needed.");
        return false;
    }
    if (name.length !== 0){
        if (name.length < 3 || name.length > 10){
            alert("Username must contain 3-10 characters.");
            return false;
        }   
    }
    if (pw1.length !== 0){
        if (pw1.length < 8 || pw1.length > 18){
            alert("Password must contain 8-18 characters.");
            return false;
        }
        if (pw1 !== pw2 && pw1.length !== 0) {
            alert("Password and Confirm Password must be the same.");
            return false;
        }    
    }
    
    if (pw2.length !== 0){
        if (pw1 !== pw2) {
            alert("Password and Confirm Password must be the same.");
            return false;
        } 
    }
    
    document.getElementById("UpdateForm").action = "update";
    return true;
    
}
