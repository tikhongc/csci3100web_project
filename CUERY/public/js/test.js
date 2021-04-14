//timeStamp will be of type Date
function getElapsedTimeString(timeStamp) {
	const minute = 1000 * 60;
	const hour = 1000 * 60 * 60;
	const day = 1000 * 60 * 60 * 24;
    const now = new Date(Date.now());
	const timeElapsed = Date.now() - timeStamp;

    if(timeElapsed < minute) return "Just now";
	if(timeElapsed < hour) return Math.floor(timeElapsed / minute) + " minutes ago";
    if(timeElapsed < day) return Math.floor(timeElapsed / hour) + " hours ago";
    if(timeElapsed < day * 30) return Math.floor(timeElapsed / day) + " days ago";
    if(timeElapsed < day * 365) return (now.getMonth() - timeStamp.getMonth()) + " months ago";
    return (now.getFullYear() - timeStamp.getFullYear()) + " years ago";
}

console.log(getElapsedTimeString(new Date("2018-01-28T00:00:00.000+00:00")));