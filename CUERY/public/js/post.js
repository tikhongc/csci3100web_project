/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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
console.log(userCookie);

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
        alert("Please login first before viewing the posts : )");
        window.location.href = "login.html";
    }
    else{   // continue loading if user are verified,  can use the user object received in the response
        console.log(data);
        document.getElementById("useravatar").src = "data:image/png;base64," + data.avatar.data;
        document.getElementById("sidebar-avatar").src = "data:image/png;base64," + data.avatar.data;
        document.getElementById("sidebar-username").innerHTML = data.name;
        document.getElementById("sidebar-email").innerHTML = "(" + data.email + ")";
        document.getElementById("sidebar-year").innerHTML = "Year: " + data.year;
        
        
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
              
function ViewPost(postid) {window.location="/viewpost.html?postid="+postid;}
function AddPost(data) { // data is an object
	var post=document.createElement("div");
	var p=document.createElement("p");
	var obj=document.createElement("div");
	p.innerHTML=data.upvotes-data.downvotes;
	p.style.fontSize="200%";
	post.appendChild(p);
	p=document.createElement("p");
	obj.innerHTML=data.title;
	p.appendChild(obj);
	obj=document.createElement("div");
	obj.classList.add("text-secondary");
	obj.innerHTML=data.owner;
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
	
	const query = new URLSearchParams(window.location.search);
	const page=query.has("page")?query.get("page"):"1";
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
		var a,pages=document.getElementById("pages");
		const pageCnt=Math.ceil(count/limit);
		for(let i=1;i<=pageCnt;++i){
			a=document.createElement("a");
			a.innerHTML=i;
			a.setAttribute("href","/main.html?page="+i);
			pages.appendChild(a);
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
        
function toggleSidebar(){
    document.getElementById('sidebar').classList.toggle('sidebar-visible'); 
    document.getElementById('useravatar').classList.toggle('useravatar-visible');
}

function CreatePost() {
	var data = {
		title:document.getElementById("title").value,
		category:document.getElementById("category").value,
		topic:document.getElementById("topic").value,
		content:document.getElementById("content").value
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