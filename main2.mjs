import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import SoundManager from "./SoundManager.mjs";
import Stick from "./Stick.mjs";
import World from "./World.mjs";
import Vector2 from "./Vector2.mjs";
import TextureLoader from "./TextureLoader.mjs";
import shieldPos from "./shieldPos.mjs";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const soundManager = new SoundManager();
await soundManager.addSounds({
    "explosion": "explosion.mov",
})

const textureLoader = new TextureLoader();
await textureLoader.addImages({
    "floor": "floor.png",
    "bg1": "backgroundnight2.png",
    "bgday": "backgroundDay.png",
    "stone": "stone.png",
})


let tps = 60;
let deltaTime = 1000 / tps;
let nowTime = performance.now();
let accumulatedTime = 0;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 0;
let lastSecondTime = 0;
let pageOutTime = 0;
let pageOutDuration = 0;


let currentZoom = 0.25;
const ZOOM_FACTOR = 1.1;

let mouse = [0,0];

let cameraX = 0;
let cameraY = 0;

const cameraSmoothness = 1;

function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left; // X relative to canvas element
    const canvasY = clientY - rect.top; // Y relative to canvas element

    const worldX = (canvasX - cameraX) / currentZoom;
    const worldY = (canvasY - cameraY) / currentZoom;
    return [worldX, worldY];
}

document.addEventListener('mousemove', function (event) {
    mouse = screenToWorld(event.clientX, event.clientY);
});
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        pageOutTime = performance.now();
    }
    else {
        pageOutDuration = performance.now() - pageOutTime;
    }
});
const keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
});
document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
})


const world = new World();

const drawText = function (color, font, text, x, y, ctx) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

function createScaledImageCanvas(image, scale) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = image.width * scale;
    tempCanvas.height = image.height * scale;

    tempCtx.imageSmoothingEnabled = false;

    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    return tempCanvas;
}

const backgroundImage1 = createScaledImageCanvas(textureLoader.getImage("bg1"), 600 / 128);
function drawBackground(xOffset, img) {
    const imageWidth = img.width;
    const imageHeight = img.height;


    let drawX = (xOffset % imageWidth + imageWidth) % imageWidth;


    let currentDrawX = drawX - imageWidth; // Start one image to the left for seamless wrapping

    while (currentDrawX < 800) {
        ctx.drawImage(img, currentDrawX, 0, imageWidth + 2, imageHeight);
        currentDrawX += imageWidth;
    }

}
const floorPattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("floor"), 8), 'repeat');
const stonePattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("stone"), 8), 'repeat');




const core = new Circle([canvas.width * 0.5, canvas.height * 0.5], true, undefined, 1, "white");
core.radius = 100;
core.friction = 1;
world.add(core);

let shieldBalls = [];

for (let i = 0; i < 200; i++) {
    let c = new Circle([shieldPos[i][0], shieldPos[i][1]], undefined, undefined, 1, "orange")
    c.isShield = true;
    world.add(c);
    // shieldBalls.push(c);
}

top.x = function () {
    return shieldBalls.map(
        function (E) {
            return E.position;
        }
    )
}




const draw = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // drawBackground(0, backgroundImage1)

    const targetCameraX = canvas.width / 2 - core.position[0] * currentZoom;
    const targetCameraY = canvas.height / 2 - core.position[1] * currentZoom;
    cameraX += (targetCameraX - cameraX) * cameraSmoothness;
    cameraY += (targetCameraY - cameraY) * cameraSmoothness;
    ctx.save();
    ctx.translate(cameraX, cameraY);
    ctx.scale(currentZoom, currentZoom);


    world.draw({
        ctx: ctx,
        textureLoader: textureLoader,
        floor: floorPattern,
        // player: player,
        canvas: canvas,
        stone: stonePattern
    });

    ctx.restore();
    drawText("black", "14px Arial", "FPS: " + Math.round(fps), 10, 20, ctx);
}

const getNnearestShieldBalls = function (n, posx, posy) {

    const x = [];

    for (let circle of world.circles) {
        if (circle.isShield) {
            x.push(circle);
        }
    }

    return x.sort(function (a, b) {
        const distA = (a.position[0] - posx) * (a.position[0] - posx) + (a.position[1] - posy) * (a.position[1] - posy);
        const distB = (b.position[0] - posx) * (b.position[0] - posx) + (b.position[1] - posy) * (b.position[1] - posy);
        return distA - distB;
    }).slice(0, n);
}

var selectedBalls = [];

const update = function () {
    for (let i = 0; i < 1; i++) {
        world.step(deltaTime);
    }
    for (let circle of world.circles) {
        if (circle.isShield) {
            const dx = canvas.width / 2 - circle.position[0];
            const dy = canvas.height / 2 - circle.position[1];
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            if(distance < 0.0001){
                continue;
            }
            const gConstant = 0.01;
            const force = gConstant * circle.mass / Math.pow(distance, 1.3);
            const ax = dx * force;
            const ay = dy * force;
            circle.acceleration[0] = ax;
            circle.acceleration[1] = ay;
            circle.color = "orange";

           
        }
    }
    selectedBalls = [];
    for(let circle of getNnearestShieldBalls(30, mouse[0], mouse[1])){
        circle.color = "red";
        selectedBalls.push(circle);
    }

}


canvas.addEventListener("click", function(){
    if(selectedBalls == []){
        return;
    }
    let average = [0,0];
    for(let c of selectedBalls){
        average[0] += c.position[0];
        average[1] += c.position[1];
    }
    average[0] /= selectedBalls.length;
    average[1] /= selectedBalls.length;
    let dx = mouse[0] - average[0];
    let dy = mouse[1] - average[1];
    let d = Math.sqrt(dx * dx + dy * dy);
    let ndx = dx / d;
    let ndy = dy / d;
    let force = 30;
    for(let c of selectedBalls){
        
        c.position[0] += ndx * force;
        c.position[1] += ndy * force;
        
    }
})




const animate = function (currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    frameCount++;
    if (currentTime >= lastSecondTime + 1000) {
        fps = frameCount;
        frameCount = 0;
        lastSecondTime = currentTime;
    }
    accumulatedTime += performance.now() - nowTime;
    accumulatedTime -= pageOutDuration;
    pageOutDuration = 0;
    while (accumulatedTime >= deltaTime) {
        update();
        accumulatedTime -= deltaTime;
    }
    nowTime = performance.now();
    draw();
    requestAnimationFrame(animate);
}

animate();