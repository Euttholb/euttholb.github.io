//v1.3
let gameRunning = false;
const HEALTH = 20;
const ENEMIES = ["Spades", "Clubs"];
const MODIFIERS = ["Hearts", "Diamonds"];
const VALUES = [2,3,4,5,6,7,8,9,10,11,12,13,14];

const player = {
    health: HEALTH,
    weapon: null,  
};

class Card {
    constructor(suite, value) {
        this.suite = suite; 
        this.value = value;  
    }
}

class Enemy extends Card {
    constructor(suite, value) {
        super(suite, value);
        this.damage = value;
    }
}

class Healer extends Card {
    constructor(suite, value) {
        super(suite, value);
        this.heal = value;
    }
}

class Weapon extends Card {
    constructor(suite, value) {
        super(suite, value);
        this.damage = value;
    }
}

function createDeck() {
    const deck = [];
    for (let i = 0; i < ENEMIES.length; i++) {
        for (let j = 0; j < VALUES.length; j++) {
            deck.push(new Enemy(ENEMIES[i], VALUES[j]));
        }
    }

    for (let i = 0; i < MODIFIERS.length; i++) {
        for (let j = 2; j <= 9; j++) {
            if (MODIFIERS[i] === "Hearts") {
                deck.push(new Healer(MODIFIERS[i], j));
            } else if (MODIFIERS[i] === "Diamonds") {
                deck.push(new Weapon(MODIFIERS[i], j));
            }
        }
    }

    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}


let firstRoom = true;
function draw(deck) {
    const room = [];
    let drawCount;

    if (firstRoom === true) { 
        drawCount = 4;
        firstRoom = false;
    } else {
        drawCount = 3;
    }

    for (let i = 0; i < drawCount; i++) {
        if (deck.length > 0) {
            room.push(deck.pop());
        }
    }
    return room;
}

function equip(card) {
    player.weapon = {
        value: card.value,
        maxKill: 14,
        card: card,
        lastKill: null
    };
}

function heal(card) {
    if (player.health < HEALTH) {
        player.health += card.heal;
    }
    if (player.health > HEALTH) {
        player.health = HEALTH;
    }
}

function fight(enemy) {
    if (!player.weapon) {
        player.health -= enemy.damage;
        return true;
    }

    let weaponPower = player.weapon.value;
    let monsterValue = enemy.value;
    let damageTaken = monsterValue - weaponPower;

    if (enemy.value > player.weapon.maxKill) {
        player.health -= enemy.damage;
        return true;
    }

    if (damageTaken > 0) {
        player.health -= damageTaken;
    }

    if (monsterValue <= player.weapon.maxKill) {
        player.weapon.maxKill = monsterValue;
        player.weapon.lastKill = enemy;
    }

    return true;
}

let lastCardPlayed = null;

function calculateScore(deck, room) {
    if (player.health <= 0) {
        let remainingMonsters = 0;
        for (let i = 0; i < deck.length; i++) {
            if (deck[i] instanceof Enemy) {
                remainingMonsters += deck[i].value;
            }
        }
        for (let i = 0; i < room.length; i++) {
            if (room[i] instanceof Enemy) {
                remainingMonsters += room[i].value;
            }
        }
        let score = player.health - remainingMonsters; 
        return score;
    } else {
        let score = player.health;
        if (lastCardPlayed instanceof Healer) {
            score += lastCardPlayed.value;
        }
        return score;
    }
}


// const deck = createDeck();
// shuffle(deck);
// let room = draw(deck);
let deck = [];
let room = [];

function updateUI() {
    document.getElementById("healthDisplay").textContent = player.health;
    document.getElementById("deckDisplay").textContent = deck.length;

    // if (player.weapon && player.weapon.value) {
    //     document.getElementById("weaponDisplay").textContent =
    //         `${player.weapon.value} (maxKill: ${player.weapon.maxKill})`;
    // } else {
    //     document.getElementById("weaponDisplay").textContent = "None";
    // }
}

//boilerplate
const canvas = document.getElementById("gameCanvas");
const gl = canvas.getContext("webgl");

const vsSource = `
attribute vec2 aPosition;
attribute vec2 aUV;

uniform vec2 uPos;
uniform vec2 uSize;

varying vec2 vTexCoord;

void main() {
    vec2 pos = aPosition * uSize + uPos;
    vTexCoord = aUV;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const fsSource = `
precision mediump float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;

void main() {
    gl_FragColor = texture2D(uTexture, vTexCoord);
}
`;

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vs = compileShader(gl.VERTEX_SHADER, vsSource);
const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
// if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//     console.error(gl.getProgramInfoLog(program));
// }
gl.useProgram(program);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


const quadVerts = new Float32Array([
    // x,    y,    u,   v
    -0.5, -0.5,  0.0, 1.0,
     0.5, -0.5,  1.0, 1.0,
     0.5,  0.5,  1.0, 0.0,

    -0.5, -0.5,  0.0, 1.0,
     0.5,  0.5,  1.0, 0.0,
    -0.5,  0.5,  0.0, 0.0
]);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

const aPositionLoc = gl.getAttribLocation(program, "aPosition");
const aUVLoc       = gl.getAttribLocation(program, "aUV");

gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 4 * 4, 0);
gl.enableVertexAttribArray(aPositionLoc);

gl.vertexAttribPointer(aUVLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
gl.enableVertexAttribArray(aUVLoc);

const uPosLoc     = gl.getUniformLocation(program, "uPos");
const uSizeLoc    = gl.getUniformLocation(program, "uSize");
const uTextureLoc = gl.getUniformLocation(program, "uTexture");

gl.uniform1i(uTextureLoc, 0);


const textureCache = {};

function loadTexture(url) {
    if (textureCache[url]) return textureCache[url];

    const tex = gl.createTexture();
    textureCache[url] = tex;


    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    const img = new Image();
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //fix interpolation
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        renderScene();
        drawCardLabels();
    };
    img.src = url;

    return tex;
}

function getCardTexture(card) {
    //const suite = card.suite.toLowerCase(); 
    const suite = card.suite;
    const value = card.value;               
    const url = `./assets/${suite}_${value}.png`;
    return loadTexture(url);
}

function drawCardTexture(x, y, w, h, texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(uPosLoc, x, y);
    gl.uniform2f(uSizeLoc, w, h);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


let slots = [];  

function renderScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    slots = [];

    const cardW = 0.25; //width
    const cardH = 0.50; //height

    //draw pile
    const drawX = -0.75;
    const drawY = 0.0;
    const backTex = loadTexture("./assets/Card_Back.png");
    drawCardTexture(drawX, drawY, cardW, cardH, backTex);

    slots.push({
        type: "drawPile",
        index: -1,
        x: drawX, y: drawY,
        w: cardW, h: cardH
    });

    //room
    const startX = -0.15;
    const startY = 0.25;
    const gapX   = 0.3;
    const gapY   = -0.6;

    for (let i = 0; i < room.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = startX + col * gapX;
        const y = startY + row * gapY;

        const card = room[i];
        const cardTex = getCardTexture(card);

        drawCardTexture(x, y, cardW, cardH, cardTex);

        slots.push({
            type: "room",
            index: i,
            x, y,
            w: cardW, h: cardH
        });
    }

    //weapon
    const weaponX = 0.75;
    const weaponY = 0.0;

    let weaponTex;
    if (player.weapon && player.weapon.card) {
        weaponTex = getCardTexture(player.weapon.card);
    } else {
        
        weaponTex = loadTexture("./assets/Card_Back.png");
    }

    drawCardTexture(weaponX, weaponY, cardW, cardH, weaponTex);

    slots.push({
        type: "weaponSlot",
        index: -1,
        x: weaponX, y: weaponY,
        w: cardW, h: cardH
    });

    if(player.weapon && player.weapon.lastKill){
    const killedCard = player.weapon.lastKill;

    const killX = weaponX + cardW * 0.0;
    const killY = weaponY + cardH * -0.50;

    const killTex = getCardTexture(killedCard);

    drawCardTexture(killX, killY, cardW, cardH, killTex);

    slots.push({
        type: "weaponKill",
        index: -1,
        x: killX, y: killY, w: cardW * 0.9, h: cardH * 0.9
    });
}
}

function startGame() {
    gameRunning = true;

    player.health = HEALTH;
    player.weapon = null;
    lastCardPlayed = null;
    firstRoom = true;
    pickedHealCard = false;

    deck = createDeck();
    shuffle(deck);
    room = draw(deck);

    updateUI();
    renderScene();
    drawCardLabels();
}

function showGameOver(score) {
    gameRunning = false;


    let msg;
    if(score < 0){
        msg = `Game Over!, Score: ${score}`; 
    } else {
        msg = `OMG YOU WON WOW, Score: ${score}`;
    }

    document.getElementById("gameOverMessage").textContent = msg;
    document.getElementById("gameOverScreen").style.display = "flex";
}



document.getElementById("startButton").onclick = () =>{
    document.getElementById("startScreen").style.display = "none";
    startGame();
}

document.getElementById("restartButton").onclick = () =>{
    document.getElementById("gameOverScreen").style.display = "none";
    startGame();
}
document.getElementById("runButton").onclick = () => {
    tryRunRoom();
}

function drawCardLabels() {
    const labelContainer = document.getElementById("labelLayer");
    if (labelContainer) {
        labelContainer.innerHTML = "";
    }
}


//mouse clicks
function getClipSpaceCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((evt.clientY - rect.top) / rect.height) * 2 - 1);
    return { x, y };
}

canvas.addEventListener("click", (evt) => {
    const pos = getClipSpaceCoords(evt);

    for (const s of slots) {
        const halfW = s.w / 2;
        const halfH = s.h / 2;
        if (
            pos.x >= s.x - halfW && pos.x <= s.x + halfW &&  //hitbox
            pos.y >= s.y - halfH && pos.y <= s.y + halfH
        ) {
            handleSlotClick(s);
            break;
        }
    }
});

let pickedHealCard = false;
let lastActionWasRun = false;
let interactedWithRoom = false;

function tryRunRoom() {


    if (lastActionWasRun) {
        console.log("Cannot run twice!");
        return;
    }

    if (interactedWithRoom) {
        console.log("Cannot run after interacting with room!");
        return;
    }


    while (room.length > 0) {
        deck.unshift(room.shift());
    }


    firstRoom = true;
    room = draw(deck);
    lastActionWasRun = true;
    interactedWithRoom = false;
    
    updateUI();
    renderScene();
    drawCardLabels();
}



function handleSlotClick(slot) {
    if (slot.type === "room") {
        if(interactedWithRoom === false){
            interactedWithRoom = true;
        }

        const index = slot.index;
        const card = room[index];

        if (card instanceof Enemy) {
            fight(card);
            room.splice(index, 1);
        } else if (card instanceof Healer) {
            if (!pickedHealCard) {
                heal(card);
                pickedHealCard = true;
            }
            room.splice(index, 1);
        } else if (card instanceof Weapon) {
            equip(card);
            room.splice(index, 1);
        }

 
        if (room.length === 1) {
            lastActionWasRun = false;
            interactedWithRoom = false;
            const lastCardArr = room;
            const newCards = draw(deck);
            pickedHealCard = false;
            lastCardPlayed = card;
            room = lastCardArr.concat(newCards);
        }

        const dungeonIsEmpty = deck.length === 0 && room.length === 0;
        if (dungeonIsEmpty) {
            const score = calculateScore(deck, room);
           //alert("Game Over! Score: " + score);
           showGameOver(score);
        }

        if (player.health <= 0) {
            const score = calculateScore(deck, room);
            //alert("You Died! Score: " + score);
            showGameOver(score);
        }

        updateUI();
        renderScene();
        drawCardLabels();
    }
}

updateUI();
renderScene();
drawCardLabels();
