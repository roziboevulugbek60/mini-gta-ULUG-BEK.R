
/* =====================================================
   GTA MINI — ULUG'BEK.R
   Complete JavaScript
===================================================== */

"use strict";

/* =====================================================
   ELEMENTS
===================================================== */

const mainMenu = document.getElementById("mainMenu");
const gameScreen = document.getElementById("gameScreen");

const playerNameInput = document.getElementById("playerName");

const newGameBtn = document.getElementById("newGameBtn");
const continueBtn = document.getElementById("continueBtn");
const loadBtn = document.getElementById("loadBtn");

const hudPlayerName = document.getElementById("hudPlayerName");
const moneyText = document.getElementById("money");

const shopMoney = document.getElementById("shopMoney");

const shopBtn = document.getElementById("shopBtn");
const closeShopBtn = document.getElementById("closeShopBtn");
const shopPanel = document.getElementById("shopPanel");

const saveBtn = document.getElementById("saveBtn");
const pauseSaveBtn = document.getElementById("pauseSaveBtn");

const pauseBtn = document.getElementById("pauseBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtn = document.getElementById("menuBtn");

const notification = document.getElementById("notification");
const saveMessage = document.getElementById("saveMessage");

const missionPanel = document.getElementById("missionPanel");
const missionText = document.getElementById("missionText");
const startMissionBtn = document.getElementById("startMissionBtn");

const gameOver = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const gameOverMenuBtn = document.getElementById("gameOverMenuBtn");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/* =====================================================
   GAME SETTINGS
===================================================== */

const SAVE_KEY = "ULUGBEK_R_GTA_MINI_SAVE";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;

let gameRunning = false;
let paused = false;

let lastTime = 0;

let camera = {
    x: 0,
    y: 0
};


/* =====================================================
   GAME DATA
===================================================== */

let gameData = {

    playerName: "O'yinchi",

    money: 100,

    health: 100,

    wanted: 0,

    missionActive: false,

    missionCompleted: false,

    carOwned: false,

    superCarOwned: false,

    blackClothes: false

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 400,

    y: 400,

    width: 28,

    height: 38,

    speed: 3.5,

    color: "#2986ff",

    inCar: false,

    direction: 1

};


/* =====================================================
   CAR
===================================================== */

const car = {

    x: 500,

    y: 450,

    width: 85,

    height: 45,

    speed: 5,

    color: "#e52d35",

    occupied: false

};


/* =====================================================
   POLICE
===================================================== */

const police = {

    x: 1700,

    y: 1000,

    width: 34,

    height: 40,

    speed: 1.8,

    active: false

};


/* =====================================================
   MISSION TARGET
===================================================== */

const mission = {

    x: 1850,

    y: 300,

    radius: 35

};


/* =====================================================
   COINS / MONEY
===================================================== */

let moneyBags = [

    { x: 700, y: 300, collected: false },

    { x: 1050, y: 500, collected: false },

    { x: 1450, y: 900, collected: false },

    { x: 1950, y: 1150, collected: false },

    { x: 600, y: 1200, collected: false }

];


/* =====================================================
   KEYBOARD
===================================================== */

const keys = {};

window.addEventListener("keydown", function (e) {

    const key = e.key.toLowerCase();

    keys[key] = true;


    /* Prevent page scrolling */

    if (
        [
            "w",
            "a",
            "s",
            "d",
            "e",
            "f",
            "p",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright"
        ].includes(key)
    ) {

        e.preventDefault();

    }


    /* PAUSE */

    if (key === "p") {

        togglePause();

    }


    /* ENTER / EXIT CAR */

    if (key === "e") {

        toggleCar();

    }


    /* MISSION */

    if (key === "f") {

        interactMission();

    }

});


window.addEventListener("keyup", function (e) {

    keys[e.key.toLowerCase()] = false;

});


/* =====================================================
   START NEW GAME
===================================================== */

newGameBtn.addEventListener("click", function () {

    let name =
        playerNameInput.value.trim();


    if (!name) {

        name = "O'yinchi";

    }


    gameData = {

        playerName: name,

        money: 100,

        health: 100,

        wanted: 0,

        missionActive: false,

        missionCompleted: false,

        carOwned: false,

        superCarOwned: false,

        blackClothes: false

    };


    player.x = 400;
    player.y = 400;

    player.inCar = false;

    car.occupied = false;

    resetMoneyBags();

    startGame();

});


/* =====================================================
   CONTINUE GAME
===================================================== */

continueBtn.addEventListener("click", function () {

    loadGame();

});


loadBtn.addEventListener("click", function () {

    loadGame();

});


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    gameRunning = true;

    paused = false;

    mainMenu.style.display = "none";

    gameScreen.style.display = "block";

    pauseMenu.style.display = "none";

    gameOver.style.display = "none";

    updateHUD();

    showNotification(
        "Xush kelibsiz, " +
        gameData.playerName +
        "! 🚗"
    );

    requestAnimationFrame(gameLoop);

}


/* =====================================================
   LOAD GAME
===================================================== */

function loadGame() {

    const saved =
        localStorage.getItem(SAVE_KEY);


    if (!saved) {

        showNotification(
            "❌ Saqlangan o'yin topilmadi!"
        );

        return;

    }


    try {

        gameData =
            JSON.parse(saved);


        startGame();


        showNotification(
            "📂 O'yin yuklandi!"
        );

    }

    catch (error) {

        console.error(error);

        showNotification(
            "❌ Save faylida xatolik!"
        );

    }

}


/* =====================================================
   SAVE GAME
===================================================== */

function saveGame() {

    const saveObject = {

        ...gameData,

        playerX: player.x,

        playerY: player.y,

        carX: car.x,

        carY: car.y,

        inCar: player.inCar,

        moneyBags: moneyBags

    };


    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveObject)
    );


    showSaveMessage();

}


/* =====================================================
   RESTORE SAVED POSITIONS
===================================================== */

function restoreSavedPositions() {

    const saved =
        localStorage.getItem(SAVE_KEY);


    if (!saved) return;


    try {

        const data =
            JSON.parse(saved);


        if (
            typeof data.playerX === "number"
        ) {

            player.x =
                data.playerX;

        }


        if (
            typeof data.playerY === "number"
        ) {

            player.y =
                data.playerY;

        }


        if (
            typeof data.carX === "number"
        ) {

            car.x =
                data.carX;

        }


        if (
            typeof data.carY === "number"
        ) {

            car.y =
                data.carY;

        }


        if (
            Array.isArray(data.moneyBags)
        ) {

            moneyBags =
                data.moneyBags;

        }

    }

    catch (error) {

        console.error(error);

    }

}


/* =====================================================
   SAVE BUTTONS
===================================================== */

saveBtn.addEventListener(
    "click",
    saveGame
);


pauseSaveBtn.addEventListener(
    "click",
    saveGame
);


/* =====================================================
   PAUSE
===================================================== */

pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    togglePause
);


function togglePause() {

    if (!gameRunning) return;


    paused = !paused;


    pauseMenu.style.display =
        paused
            ? "flex"
            : "none";


    if (paused) {

        showNotification(
            "⏸️ O'yin pauzada"
        );

    }

}


/* =====================================================
   BACK TO MENU
===================================================== */

menuBtn.addEventListener(
    "click",
    function () {

        saveGame();

        gameRunning = false;

        paused = false;

        pauseMenu.style.display =
            "none";

        gameScreen.style.display =
            "none";

        mainMenu.style.display =
            "flex";

    }
);


/* =====================================================
   SHOP
===================================================== */

shopBtn.addEventListener(
    "click",
    function () {

        shopPanel.style.display =
            "block";

        updateHUD();

    }
);


closeShopBtn.addEventListener(
    "click",
    function () {

        shopPanel.style.display =
            "none";

    }
);


/* =====================================================
   SHOP BUY SYSTEM
===================================================== */

document
    .querySelectorAll(".buy-button")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const item =
                    button.dataset.item;

                const price =
                    Number(
                        button.dataset.price
                    );


                if (
                    gameData.money <
                    price
                ) {

                    showNotification(
                        "💸 Pul yetarli emas!"
                    );

                    return;

                }


                if (
                    item === "sportCar"
                ) {

                    if (
                        gameData.carOwned
                    ) {

                        showNotification(
                            "🚗 Bu mashina sizda bor!"
                        );

                        return;

                    }


                    gameData.money -=
                        price;

                    gameData.carOwned =
                        true;

                    showNotification(
                        "🚗 Sport Car sotib olindi!"
                    );

                }


                if (
                    item === "superCar"
                ) {

                    if (
                        gameData.superCarOwned
                    ) {

                        showNotification(
                            "🏎️ Super Car sizda bor!"
                        );

                        return;

                    }


                    gameData.money -=
                        price;

                    gameData.superCarOwned =
                        true;

                    car.color =
                        "#8b32ff";

                    car.speed =
                        7;

                    showNotification(
                        "🏎️ Super Car sotib olindi!"
                    );

                }


                if (
                    item === "blackClothes"
                ) {

                    if (
                        gameData.blackClothes
                    ) {

                        showNotification(
                            "👕 Kiyim sizda bor!"
                        );

                        return;

                    }


                    gameData.money -=
                        price;

                    gameData.blackClothes =
                        true;

                    player.color =
                        "#111111";

                    showNotification(
                        "👕 Qora kiyim sotib olindi!"
                    );

                }


                updateHUD();

                saveGame();

            }

        );

    });


/* =====================================================
   CAR SYSTEM
===================================================== */

function toggleCar() {

    if (!gameRunning || paused) {
        return;
    }


    const distance =
        Math.hypot(
            player.x - car.x,
            player.y - car.y
        );


    if (
        !player.inCar &&
        distance < 90
    ) {

        if (
            !gameData.carOwned &&
            !gameData.superCarOwned
        ) {

            showNotification(
                "🚗 Avval Shop'dan mashina sotib oling!"
            );

            return;

        }


        player.inCar = true;

        car.occupied = true;

        player.x = car.x;

        player.y = car.y;

        showNotification(
            "🚗 Mashinaga o'tirdingiz!"
        );

    }

    else if (player.inCar) {

        player.inCar = false;

        car.occupied = false;

        player.x += 60;

        showNotification(
            "🚶 Mashinadan tushdingiz!"
        );

    }

}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function movePlayer(dt) {

    let speed =
        player.inCar
            ? car.speed
            : player.speed;


    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= 1;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += 1;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= 1;

        player.direction = -1;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += 1;

        player.direction = 1;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(dx, dy);


        dx /= length;
        dy /= length;


        player.x +=
            dx * speed;

        player.y +=
            dy * speed;

    }


    /* WORLD LIMITS */

    player.x =
        Math.max(
            30,
            Math.min(
                WORLD_WIDTH - 30,
                player.x
            )
        );


    player.y =
        Math.max(
            30,
            Math.min(
                WORLD_HEIGHT - 30,
                player.y
            )
        );


    /* CAR POSITION */

    if (player.inCar) {

        car.x = player.x;

        car.y = player.y;

    }

}


/* =====================================================
   COLLECT MONEY
===================================================== */

function collectMoney() {

    if (player.inCar) {
        return;
    }


    moneyBags.forEach(
        function (bag) {

            if (bag.collected) {
                return;
            }


            const distance =
                Math.hypot(
                    player.x - bag.x,
                    player.y - bag.y
                );


            if (distance < 40) {

                bag.collected =
                    true;

                gameData.money +=
                    50;

                updateHUD();

                showNotification(
                    "💰 +50 pul!"
                );

            }

        }
    );

}


/* =====================================================
   MISSION INTERACTION
===================================================== */

function interactMission() {

    if (!gameRunning || paused) {
        return;
    }


    const distance =
        Math.hypot(
            player.x - mission.x,
            player.y - mission.y
        );


    if (distance > 100) {

        showNotification(
            "🎯 Missiya joyiga boring!"
        );

        return;

    }


    if (
        !gameData.missionActive &&
        !gameData.missionCompleted
    ) {

        missionPanel.style.display =
            "block";

        return;

    }


    if (
        gameData.missionActive
    ) {

        completeMission();

    }

}


/* =====================================================
   START MISSION
===================================================== */

startMissionBtn.addEventListener(
    "click",
    function () {

        gameData.missionActive =
            true;

        missionPanel.style.display =
            "none";

        missionText.textContent =
            "Sariq belgiga boring";

        showNotification(
            "🎯 Missiya boshlandi!"
        );

    }
);


/* =====================================================
   COMPLETE MISSION
===================================================== */

function completeMission() {

    gameData.missionActive =
        false;

    gameData.missionCompleted =
        true;

    gameData.money +=
        200;

    gameData.wanted +=
        1;

    missionText.textContent =
        "Bajarildi!";


    updateHUD();


    showNotification(
        "🏆 Missiya bajarildi! +200 💰"
    );


    setTimeout(
        function () {

            gameData.wanted =
                Math.max(
                    0,
                    gameData.wanted - 1
                );

            updateHUD();

        },
        15000
    );

}


/* =====================================================
   POLICE AI
===================================================== */

function updatePolice() {

    if (
        gameData.wanted <= 0
    ) {

        police.active =
            false;

        return;

    }


    police.active =
        true;


    const targetX =
        player.x;

    const targetY =
        player.y;


    const dx =
        targetX - police.x;

    const dy =
        targetY - police.y;


    const distance =
        Math.hypot(
            dx,
            dy
        );


    if (
        distance > 1
    ) {

        police.x +=
            (dx / distance) *
            police.speed;

        police.y +=
            (dy / distance) *
            police.speed;

    }


    /* POLICE CATCH */

    if (
        distance < 45
    ) {

        gameData.health -=
            0.15;


        if (
            gameData.health <= 0
        ) {

            playerCaught();

        }

    }

}


/* =====================================================
   PLAYER CAUGHT
===================================================== */

function playerCaught() {

    gameData.money =
        Math.max(
            0,
            gameData.money - 100
        );

    gameData.health =
        100;

    gameData.wanted =
        0;

    player.x = 400;
    player.y = 400;

    police.x = 1700;
    police.y = 1000;

    showNotification(
        "🚓 Politsiya sizni ushladi! -100 💰"
    );

    updateHUD();

}


/* =====================================================
   UPDATE CAMERA
===================================================== */

function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;


    camera.x =
        Math.max(
            0,
            Math.min(
                WORLD_WIDTH -
                canvas.width,
                camera.x
            )
        );


    camera.y =
        Math.max(
            0,
            Math.min(
                WORLD_HEIGHT -
                canvas.height,
                camera.y
            )
        );

}


/* =====================================================
   DRAW CITY
===================================================== */

function drawCity() {

    /* BACKGROUND */

    ctx.fillStyle =
        "#267a35";

    ctx.fillRect(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT
    );


    /* GRASS AREAS */

    ctx.fillStyle =
        "#2c8b3d";

    for (
        let x = 0;
        x < WORLD_WIDTH;
        x += 300
    ) {

        for (
            let y = 0;
            y < WORLD_HEIGHT;
            y += 300
        ) {

            ctx.fillRect(
                x + 10,
                y + 10,
                270,
                270
            );

        }

    }


    /* ROADS */

    ctx.fillStyle =
        "#303236";


    /* Horizontal roads */

    for (
        let y = 180;
        y < WORLD_HEIGHT;
        y += 350
    ) {

        ctx.fillRect(
            0,
            y,
            WORLD_WIDTH,
            110
        );

    }


    /* Vertical roads */

    for (
        let x = 180;
        x < WORLD_WIDTH;
        x += 400
    ) {

        ctx.fillRect(
            x,
            0,
            110,
            WORLD_HEIGHT
        );

    }


    /* ROAD LINES */

    ctx.strokeStyle =
        "#d6bd47";

    ctx.lineWidth = 4;

    ctx.setLineDash([
        25,
        20
    ]);


    for (
        let y = 235;
        y < WORLD_HEIGHT;
        y += 350
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            WORLD_WIDTH,
            y
        );

        ctx.stroke();

    }


    for (
        let x = 235;
        x < WORLD_WIDTH;
        x += 400
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            WORLD_HEIGHT
        );

        ctx.stroke();

    }


    ctx.setLineDash([]);


    /* BUILDINGS */

    drawBuildings();

}


/* =====================================================
   BUILDINGS
===================================================== */

function drawBuildings() {

    const buildings = [

        {
            x: 50,
            y: 50,
            w: 100,
            h: 100,
            color: "#875c42"
        },

        {
            x: 320,
            y: 50,
            w: 180,
            h: 100,
            color: "#426a85"
        },

        {
            x: 650,
            y: 50,
            w: 130,
            h: 100,
            color: "#9b5145"
        },

        {
            x: 1000,
            y: 50,
            w: 190,
            h: 100,
            color: "#715b92"
        },

        {
            x: 1450,
            y: 50,
            w: 150,
            h: 100,
            color: "#916b3c"
        },

        {
            x: 1900,
            y: 50,
            w: 220,
            h: 100,
            color: "#3d7182"
        },


        {
            x: 50,
            y: 600,
            w: 160,
            h: 150,
            color: "#754f4f"
        },

        {
            x: 320,
            y: 600,
            w: 200,
            h: 150,
            color: "#4d7182"
        },

        {
            x: 700,
            y: 600,
            w: 150,
            h: 150,
            color: "#85653d"
        },

        {
            x: 1050,
            y: 600,
            w: 220,
            h: 150,
            color: "#62507d"
        },

        {
            x: 1450,
            y: 600,
            w: 160,
            h: 150,
            color: "#8a5547"
        },

        {
            x: 1850,
            y: 600,
            w: 250,
            h: 150,
            color: "#456f59"
        },


        {
            x: 50,
            y: 1050,
            w: 200,
            h: 170,
            color: "#765746"
        },

        {
            x: 400,
            y: 1050,
            w: 160,
            h: 170,
            color: "#3f7185"
        },

        {
            x: 750,
            y: 1050,
            w: 230,
            h: 170,
            color: "#885046"
        },

        {
            x: 1150,
            y: 1050,
            w: 180,
            h: 170,
            color: "#665286"
        },

        {
            x: 1500,
            y: 1050,
            w: 180,
            h: 170,
            color: "#83663c"
        },

        {
            x: 1900,
            y: 1050,
            w: 230,
            h: 170,
            color: "#416e81"
        }

    ];


    buildings.forEach(
        function (building) {

            ctx.fillStyle =
                "rgba(0,0,0,.25)";

            ctx.fillRect(
                building.x + 8,
                building.y + 8,
                building.w,
                building.h
            );


            ctx.fillStyle =
                building.color;

            ctx.fillRect(
                building.x,
                building.y,
                building.w,
                building.h
            );


            /* ROOF */

            ctx.fillStyle =
                "rgba(0,0,0,.15)";

            ctx.fillRect(
                building.x,
                building.y,
                building.w,
                12
            );


            /* WINDOWS */

            ctx.fillStyle =
                "#dff5d7";


            for (
                let wx =
                    building.x + 18;

                wx <
                building.x +
                building.w - 10;

                wx += 35
            ) {

                for (
                    let wy =
                        building.y + 25;

                    wy <
                    building.y +
                    building.h - 10;

                    wy += 35
                ) {

                    ctx.fillRect(
                        wx,
                        wy,
                        12,
                        14
                    );

                }

            }

        }
    );

}


/* =====================================================
   DRAW MONEY BAGS
===================================================== */

function drawMoneyBags() {

    moneyBags.forEach(
        function (bag) {

            if (bag.collected) {
                return;
            }


            ctx.save();


            ctx.fillStyle =
                "#ffd52a";


            ctx.beginPath();

            ctx.arc(
                bag.x,
                bag.y,
                13,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#174c25";

            ctx.font =
                "bold 15px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "$",
                bag.x,
                bag.y
            );


            ctx.restore();

        }
    );

}


/* =====================================================
   DRAW MISSION
===================================================== */

function drawMission() {

    if (
        gameData.missionCompleted
    ) {

        return;

    }


    ctx.save();


    ctx.strokeStyle =
        "#ffd83d";

    ctx.lineWidth = 5;


    ctx.beginPath();

    ctx.arc(
        mission.x,
        mission.y,
        mission.radius,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.fillStyle =
        "#ffd83d";

    ctx.font =
        "bold 22px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "!",
        mission.x,
        mission.y + 8
    );


    ctx.restore();

}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    if (player.inCar) {
        return;
    }


    /* SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,.3)";

    ctx.beginPath();

    ctx.ellipse(
        player.x,
        player.y + 22,
        20,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* BODY */

    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        player.x - 14,
        player.y - 5,
        28,
        30
    );


    /* HEAD */

    ctx.fillStyle =
        "#e6a26c";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y - 15,
        12,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* HAIR */

    ctx.fillStyle =
        "#17110d";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y - 20,
        10,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* NAME */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        gameData.playerName,
        player.x,
        player.y - 35
    );

}


/* =====================================================
   DRAW CAR
===================================================== */

function drawCar() {

    ctx.save();


    /* SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,.3)";

    ctx.fillRect(
        car.x - 39,
        car.y - 18,
        82,
        45
    );


    /* BODY */

    ctx.fillStyle =
        car.color;

    ctx.fillRect(
        car.x - 42,
        car.y - 20,
        84,
        40
    );


    /* ROOF */

    ctx.fillStyle =
        car.color;

    ctx.beginPath();

    ctx.moveTo(
        car.x - 25,
        car.y - 20
    );

    ctx.lineTo(
        car.x - 13,
        car.y - 36
    );

    ctx.lineTo(
        car.x + 22,
        car.y - 36
    );

    ctx.lineTo(
        car.x + 32,
        car.y - 20
    );

    ctx.closePath();

    ctx.fill();


    /* WINDOWS */

    ctx.fillStyle =
        "#9dd5e8";

    ctx.fillRect(
        car.x - 18,
        car.y - 31,
        16,
        11
    );

    ctx.fillRect(
        car.x + 3,
        car.y - 31,
        17,
        11
    );


    /* WHEELS */

    ctx.fillStyle =
        "#111111";

    ctx.beginPath();

    ctx.arc(
        car.x - 28,
        car.y + 20,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        car.x + 28,
        car.y + 20,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


/* =====================================================
   DRAW POLICE
===================================================== */

function drawPolice() {

    if (!police.active) {
        return;
    }


    ctx.save();


    /* BODY */

    ctx.fillStyle =
        "#f4f4f4";

    ctx.fillRect(
        police.x - 17,
        police.y - 15,
        34,
        40
    );


    /* BLUE PART */

    ctx.fillStyle =
        "#1f4fa3";

    ctx.fillRect(
        police.x - 17,
        police.y - 15,
        34,
        13
    );


    /* HEAD */

    ctx.fillStyle =
        "#dfa06b";

    ctx.beginPath();

    ctx.arc(
        police.x,
        police.y - 25,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* POLICE LIGHT */

    ctx.fillStyle =
        "#ff3030";

    ctx.fillRect(
        police.x - 12,
        police.y - 39,
        10,
        5
    );

    ctx.fillStyle =
        "#348cff";

    ctx.fillRect(
        police.x + 2,
        police.y - 39,
        10,
        5
    );


    ctx.restore();

}


/* =====================================================
   DRAW HUD IN CANVAS
===================================================== */

function drawWantedStars() {

    const stars =
        "★".repeat(
            Math.min(
                gameData.wanted,
                5
            )
        );


    if (!stars) {
        return;
    }


    ctx.save();


    ctx.fillStyle =
        "#ffd83d";

    ctx.font =
        "bold 20px Arial";

    ctx.textAlign =
        "right";

    ctx.fillText(
        stars,
        canvas.width - 25,
        35
    );


    ctx.restore();

}


/* =====================================================
   DRAW
===================================================== */

function render() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    ctx.translate(
        -camera.x,
        -camera.y
    );


    drawCity();

    drawMoneyBags();

    drawMission();

    drawCar();

    drawPlayer();

    drawPolice();


    ctx.restore();


    drawWantedStars();

}


/* =====================================================
   UPDATE HUD
===================================================== */

function updateHUD() {

    hudPlayerName.textContent =
        gameData.playerName;

    moneyText.textContent =
        gameData.money;

    shopMoney.textContent =
        gameData.money;


    if (
        gameData.missionCompleted
    ) {

        missionText.textContent =
            "Bajarildi ✅";

    }

    else if (
        gameData.missionActive
    ) {

        missionText.textContent =
            "Belgiga boring 🎯";

    }

    else {

        missionText.textContent =
            "F — Missiya";

    }


    /* PLAYER COLOR */

    if (
        gameData.blackClothes
    ) {

        player.color =
            "#111111";

    }


    /* CAR */

    if (
        gameData.superCarOwned
    ) {

        car.color =
            "#8b32ff";

        car.speed =
            7;

    }

    else {

        car.color =
            "#e52d35";

        car.speed =
            5;

    }

}


/* =====================================================
   NOTIFICATION
===================================================== */

let notificationTimeout;


function showNotification(message) {

    notification.textContent =
        message;

    notification.style.opacity =
        "1";


    clearTimeout(
        notificationTimeout
    );


    notificationTimeout =
        setTimeout(
            function () {

                notification.style.opacity =
                    "0";

            },
            2500
        );

}


/* =====================================================
   SAVE MESSAGE
===================================================== */

let saveMessageTimeout;


function showSaveMessage() {

    saveMessage.classList.add(
        "show"
    );


    clearTimeout(
        saveMessageTimeout
    );


    saveMessageTimeout =
        setTimeout(
            function () {

                saveMessage.classList.remove(
                    "show"
                );

            },
            1800
        );

}


/* =====================================================
   RESET MONEY BAGS
===================================================== */

function resetMoneyBags() {

    moneyBags = [

        {
            x: 700,
            y: 300,
            collected: false
        },

        {
            x: 1050,
            y: 500,
            collected: false
        },

        {
            x: 1450,
            y: 900,
            collected: false
        },

        {
            x: 1950,
            y: 1150,
            collected: false
        },

        {
            x: 600,
            y: 1200,
            collected: false
        }

    ];

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }


    const dt =
        Math.min(
            (timestamp - lastTime) / 16.67,
            2
        );


    lastTime =
        timestamp;


    if (!paused) {

        movePlayer(dt);

        collectMoney();

        updatePolice();

        updateCamera();

    }


    render();


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   GAME OVER / RESTART
===================================================== */

restartBtn.addEventListener(
    "click",
    function () {

        gameOver.style.display =
            "none";

        newGameBtn.click();

    }
);


gameOverMenuBtn.addEventListener(
    "click",
    function () {

        gameOver.style.display =
            "none";

        gameScreen.style.display =
            "none";

        mainMenu.style.display =
            "flex";

        gameRunning = false;

    }
);


/* =====================================================
   MOBILE TOUCH CONTROLS
===================================================== */

let touchStart = null;


canvas.addEventListener(
    "touchstart",
    function (e) {

        e.preventDefault();


        const touch =
            e.touches[0];


        touchStart = {

            x: touch.clientX,

            y: touch.clientY

        };

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchmove",
    function (e) {

        e.preventDefault();


        if (!touchStart) {
            return;
        }


        const touch =
            e.touches[0];


        const dx =
            touch.clientX -
            touchStart.x;

        const dy =
            touch.clientY -
            touchStart.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        if (
            distance > 5
        ) {

            player.x +=
                dx * 0.08;

            player.y +=
                dy * 0.08;

        }


        touchStart = {

            x: touch.clientX,

            y: touch.clientY

        };

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    function () {

        touchStart = null;

    }
);


/* =====================================================
   AUTO SAVE
===================================================== */

setInterval(
    function () {

        if (
            gameRunning &&
            !paused
        ) {

            saveGame();

        }

    },
    30000
);


/* =====================================================
   INITIAL MENU
===================================================== */

(function init() {

    gameScreen.style.display =
        "none";

    mainMenu.style.display =
        "flex";

    pauseMenu.style.display =
        "none";

    shopPanel.style.display =
        "none";

    missionPanel.style.display =
        "none";

    gameOver.style.display =
        "none";


    const saved =
        localStorage.getItem(
            SAVE_KEY
        );


    if (!saved) {

        continueBtn.style.opacity =
            "0.5";

    }


    console.log(
        "🚗 GTA MINI — ULUG'BEK.R"
    );

})();

