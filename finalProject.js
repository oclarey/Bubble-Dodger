(function wholeGame() {

    var canvas;
    var ctx;
    var w = 1000;
    var h = 600;
    var allCircles = [];
    var powerUps = [];
    var spawnCircles;
    var spawnPowerUps;
    var timer;
    var oneDegree = 2 * Math.PI / 360;
    var timerIn = {
        "miliSec": 0,
        "sec": 0,
        "min": 0,
    };
    var timerOut = {
        "miliSec": 0,
        "sec": 0,
        "min": 0,
    };
    var cursor = {
        "x": 0,
        "y": 0,
        "c": 200,
        "a": 1,
        "r": 5,
    }

    document.querySelector("#button").onclick = startGame;
    document.querySelector("#myCanvas").onmousemove = mouseMove;


    setUpCanvas();
    circle(cursor);
    updateLeaderboard();
    animationLoop();


    function animationLoop() {
        clear();
        circle(cursor);
        deployShapes();
        applyCollision();
        gameOverCheck();
        drawPowerUps(powerUps);
        requestAnimationFrame(animationLoop);
    }

    function startGame() {
        startSpawn();
        startTimer();
        startPowerUpSpawn();

        ///  ENTIRE GAME INSIDE

    }

    //////////////

    function startPowerUpSpawn() {
        spawnPowerUps = setInterval(createPowerUps, 30000); ///// Interval source: https://www.w3schools.com/js/js_timing.asp
    }

    function drawPowerUps(a) {
        for (var i = 0; i < a.length; i++) {
            rectO(a[i]);
            powerUpMovement(a[i]);
        }
        powerUpGet();
    }

    function powerUpMovement(o) {
        o.angle = (o.angle + o.changle) % 360;
        o.a -= o.da;
        if (o.a <= 0) {
            powerUps.splice(0, 1); //https://www.w3schools.com/jsref/jsref_splice.asp -----> this was touched on during the semseter but I needed further clarification
        }
    }

    function powerUpGet() {
        for (i = 0; i < powerUps.length; i++) {
            var differencex = Math.abs(cursor.x - powerUps[i].x);
            var differencey = Math.abs(cursor.y - powerUps[i].y);
            var hdist = Math.sqrt(differencex * differencex + differencey * differencey);
            if (hdist < cursor.r + powerUps[i].r) {
                allCircles.splice(0, randi(10));
                //allCircles.length - randi(15);
                powerUps.length = 0;
            }
        }
    }

    function createPowerUps() {
        powerUps.push({
            "x": rand(w),
            "dx": randn(5),
            "y": rand(h),
            "dy": randn(5),
            "w": 20,
            "h": 20,
            "c": 240,
            "a": 0.7,
            "da": 0.001,
            "r": 5,
            "angle": 0,
            "changle": rand(1),
        });
    }


    function startTimer() {
        timer = setInterval(timeRecord, 10);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function startSpawn() {
        spawnCircles = setInterval(createCircles, 2000);
    }

    function stopSpawn() {
        clearInterval(spawnCircles);
    }

    ////// For the timing aspect of this game, I referenced this https://stackoverflow.com/questions/31559469/how-to-create-a-simple-javascript-timer
    function timeRecord() {

        timerOut.miliSec = addZero(timerIn.miliSec);
        timerOut.sec = addZero(timerIn.sec);
        timerOut.min = addZero(timerIn.min);

        timerIn.miliSec = ++timerIn.miliSec;

        if (timerIn.miliSec === 100) {
            timerIn.miliSec = 0;
            timerIn.sec = ++timerIn.sec;
        }

        if (timerIn.sec == 60) {
            timerIn.min = ++timerIn.min;
            timerIn.sec = 0;
        }
        //////// touched on in class but further referenced from https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
        document.querySelector("#milisec").innerHTML = timerOut.miliSec;
        document.querySelector("#sec").innerHTML = timerOut.sec;
        document.querySelector("#min").innerHTML = timerOut.min;

    }

    function addZero(time) {
        if (time < 10) {
            time = "0" + time;
        }
        return time;
    }

    function mouseMove(event) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
    }

    function gameOverCheck() {
        for (i = 0; i < allCircles.length; i++) {
            var differencex = Math.abs(cursor.x - allCircles[i].x);
            var differencey = Math.abs(cursor.y - allCircles[i].y);
            var hdist = Math.sqrt(differencex * differencex + differencey * differencey);
            var circleNum = allCircles.length;
            if (hdist < cursor.r + allCircles[i].r) {
                allCircles.length = 0;
                stopSpawn();
                stopTimer();
                /// promt reference https://www.w3schools.com/js/js_popup.asp and https://www.w3schools.com/jsref/met_win_prompt.asp
                var player = prompt("good-game but...YOU LOSE!\nYour score is " + timerOut.min + ":" + timerOut.sec + ":" + timerOut.miliSec + "\n You dodged " + circleNum + " bubble(s)!\nPlease enter your name for the localized leaderboard :)", "Your name...");
                if (player != null) {
                    storePlayerInfo(timerOut, player);
                    window.location.reload(); ////// https://www.w3schools.com/jsref/met_loc_reload.asp got this from here :)
                } else {
                    window.location.reload();
                }
            }
        }
    }

    //////////// lots of info found here = https://stackoverflow.com/questions/43762363/how-to-store-an-array-of-objects-in-local-storage and https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
    function storePlayerInfo(timer, player) {
        var leaderBoardString = localStorage.getItem("leaderboard"); ////// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
        var leaderBoard = [];
        if (leaderBoardString != null) {
            leaderBoard = JSON.parse(leaderBoardString); ////// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse 
        }

        leaderBoard.push({
            "player": player,
            "min": timer.min,
            "sec": timer.sec,
        })
        leaderBoard.sort(function (a, b) { //////////// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            if (a.min === b.min) {
                if (a.sec === b.sec) {
                    return 0; //// a and b are equal
                } if (a.sec > b.sec) {
                    return -1; //// a should come after b
                } if (a.sec < b.sec) {
                    return 1; //// a should come before b
                }
            } if (a.min > b.min) {
                return -1;
            } if (a.min < b.min) {
                return 1;
            }
        })
        var localStorageData = JSON.stringify(leaderBoard); //////// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#:~:text=The%20JSON.,a%20replacer%20array%20is%20specified.
        localStorage.setItem("leaderboard", localStorageData);

    }


    ///////// References used for this section = https://stackoverflow.com/questions/43762363/how-to-store-an-array-of-objects-in-local-storage https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#:~:text=The%20JSON.,a%20replacer%20array%20is%20specified.
    function updateLeaderboard() {
        var table = document.querySelector("#table");
        for (i = 1; i < table.childNodes.length; i++) { ////// https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild 
            table.removeChild(table.childNodes[i]);
        }

        var leaderBoardString = localStorage.getItem("leaderboard");
        var leaderBoard = [];
        if (leaderBoardString != null) {
            leaderBoard = JSON.parse(leaderBoardString); ////// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse 
        }
        for (i = 0; i < leaderBoard.length; i++) {
            var row = document.createElement("tr");
            var cellName = document.createElement("td");
            var cellTime = document.createElement("td");
            cellName.innerText = leaderBoard[i].player;
            cellTime.innerText = leaderBoard[i].min + ":" + leaderBoard[i].sec;
            row.appendChild(cellName);
            row.appendChild(cellTime);
            table.appendChild(row);
        }
        if (leaderBoard.length >= 1) {
            document.querySelector("#highScore").innerText = "'" + leaderBoard[0].player + "', who survived " + leaderBoard[0].min + ":" + leaderBoard[0].sec;
        } else {
            document.querySelector("#highScore").innerText = "No one yet!";
        }
    }


    function deployShapes() {
        for (var i = 0; i < allCircles.length; i++) {
            circle(allCircles[i]);
            moveCircles(allCircles[i]);
            bounce(allCircles[i]);
            applyCollision(allCircles);
        }
    }

    function createCircles() {
        allCircles.push({
            "x": w / 2,
            "changex": randn(5),
            "changey": randn(5),
            "y": 0,
            "c": 0,
            "dc": 0.2,
            "a": 0.5,
            "r": 10 + rand(30),
        })
    }

    function applyCollision() {
        for (var i = 0; i < allCircles.length - 1; i += 1) {
            for (var j = i + 1; j < allCircles.length; j += 1) {
                collision(allCircles[i], allCircles[j]);
            }
        }
    }

    function collision(o1, o2) {
        var differencex = Math.abs(o1.x - o2.x);
        var differencey = Math.abs(o1.y - o2.y);
        var hdist = Math.sqrt(differencex * differencex + differencey * differencey);
        if (hdist < o1.r + o2.r) {
            var changex1 = o1.changex;
            var changey1 = o1.changey;
            var changex2 = o2.changex;
            var changey2 = o2.changey;
            var m1 = Math.PI * Math.pow(o1.r, 2);
            var m2 = Math.PI * Math.pow(o2.r, 2);
            o1.changey = (2 * changey2 + (m1 / m2 - 1) * changey1) / (1 + (m1 / m2));
            o1.changex = (2 * changex2 + (m1 / m2 - 1) * changex1) / (1 + (m1 / m2));
            o2.changey = (2 * changey1 + (m2 / m1 - 1) * changey2) / (1 + (m2 / m1));
            o2.changex = (2 * changex1 + (m2 / m1 - 1) * changex2) / (1 + (m2 / m1));

            ////////////////////// Tired to figure out more complex physics with what I know from highschool, this code kind of works - velocity post collision is now affected by objects mass
            ////////////////////// This source helped: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
        }
    }

    function moveCircles(o) {
        o.x += o.changex;
        o.y += o.changey;
    }

    function bounce(o) {
        if (o.x > w || o.x < 0) {
            o.changex *= -1;
        };
        if (o.y > h || o.y < 0) {
            o.changey *= -1;
        }
    }

    function circle(o) {
        if (o.r >= 0) {
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
            ctx.fillStyle = "hsla(" + o.c + ", 100%,50%, " + o.a + ")";
            ctx.fill();
        }
    }

    function rectO(o) {
        ctx.save();

        var x = o.x;
        var y = o.y;

        ctx.translate(x, y); ////------->https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save
        ctx.rotate(o.angle * oneDegree); ////----I struggled with the geometry for this effect so I used this method I found here ---> https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate

        var halfW = o.w / 2;
        var halfH = o.h / 2;

        ctx.beginPath();
        ctx.moveTo(-halfW, -halfH);
        ctx.lineTo(halfW, -halfH);
        ctx.lineTo(halfW, halfH);
        ctx.lineTo(-halfW, halfH);
        ctx.lineTo(-halfW, -halfH);

        ctx.fillStyle = "hsla(" + o.c + ", 100%,50%, " + o.a + ")";
        ctx.fill();
        o.x = x;
        o.y = y;

        ctx.restore();
    }

    function clear() {
        ctx.clearRect(0, 0, w, h);
    }

    function randn(r) {
        var result = Math.random() * r - r / 2;
        return result
    }

    function randi(r) {
        return Math.floor(Math.random() * r)
    }

    function rand(r) {
        return Math.random() * r
    }

    function setUpCanvas() {
        canvas = document.querySelector("#myCanvas");
        ctx = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        canvas.style.border = "0.5px solid lightcoral";
    }
})()

console.log("Final Project: 'Bubble Dodger'");