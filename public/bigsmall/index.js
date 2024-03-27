var url = new URL(location.href);
var playerid = url.searchParams.get("id");

function bet(value){
    console.log("URL : " + url)
    console.log("playerId : " + playerId)
    // Submit highscore to Telegram
    var xmlhttp = new XMLHttpRequest();
    // var url = "https://trex-brian-tele-01-8d0441e438f8.herokuapp.com/highscore/" + distance + 
    var url = "https://localhost:3000/bet/" + distance + 
        "?id=" + playerid + "&value=" + value;
    var sendingText = document.getElementById("sendingText");
    sendingText.style.display = "block";

    xmlhttp.onreadystatechange = function() {
       sendingText.style.display = "none";
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}