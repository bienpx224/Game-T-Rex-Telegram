var url = new URL(location.href);
var playerid = url.searchParams.get("id");

function bet(value){
    console.log("URL : " + url)
    console.log("playerId : " + playerid)
    // Submit highscore to Telegram
    var xmlhttp = new XMLHttpRequest();
    var url = "https://trex-brian-tele-01-8d0441e438f8.herokuapp.com/bet/" + value + 
    // var url = "https://localhost:3000/bet/" + distance + 
        "?id=" + playerid + "&value=" + value;

    xmlhttp.onreadystatechange = function() {
    
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}