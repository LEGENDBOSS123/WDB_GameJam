import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import SoundManager from "./SoundManager.mjs";
import Stick from "./Stick.mjs";
import World from "./World.mjs";
import Vector2 from "./Vector2.mjs";
import TextureLoader from "./TextureLoader.mjs";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// ctx.imageSmoothingEnabled = false;
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


let currentZoom = 1.0;
const ZOOM_FACTOR = 1.1;





function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left; // X relative to canvas element
    const canvasY = clientY - rect.top; // Y relative to canvas element

    const worldX = (canvasX - cameraX) / currentZoom;
    const worldY = (canvasY - cameraY) / currentZoom;
    return [worldX, worldY];
}

// selected shape handler
let selectedShape = "";
let lastShape = null;
let mouse = [0, 0];
document.getElementById("boxTypeBtn").addEventListener("click", function () {
    selectedShape = "box";
    lastShape = null;
})
document.getElementById("circleTypeBtn").addEventListener("click", function () {
    selectedShape = "circle";
})
document.getElementById("stickTypeBtn").addEventListener("click", function () {
    selectedShape = "stick";
    lastShape = null;
})
document.getElementById("wallTypeBtn").addEventListener("click", function () {
    selectedShape = "wall";
    lastShape = null;
})
canvas.addEventListener("click", function (event) {
    mouse = [event.clientX, event.clientY];
    if (selectedShape == "circle") {
        world.add(new Circle(screenToWorld(event.clientX, event.clientY), document.getElementById("isStaticInput").checked, [0, 0.0001]));
    }
    else if (selectedShape == "stick") {
        if (lastShape == null) {
            const c = new Circle(screenToWorld(event.clientX, event.clientY), true);
            lastShape = c;
        }
        else {
            const pos = screenToWorld(event.clientX, event.clientY);
            const diff = Vector2.subtractArrays(pos, lastShape.position);
            const mag = Math.sqrt(Vector2.magnitudeSquaredArray(diff));
            const number = Math.floor(mag / 20);
            const circles = [];
            for (let i = 0; i < number; i++) {
                const c = new Circle(Vector2.addArrays(lastShape.position, Vector2.scaleArray(diff, i / number)), (i == number - 1 && document.getElementById("isStaticInput").checked) || i == 0, [0, 0.0001], 0.2);
                circles.push(c);
                world.add(c);
            }
            for (let i = 0; i < circles.length - 1; i++) {
                world.add(new Stick(circles[i].id, circles[i + 1].id,
                    25,//Math.sqrt(Vector2.magnitudeSquaredArray(Vector2.subtractArrays(circles[i].position, circles[i + 1].position)))
                ));
            }

            lastShape = null;

        }
    }
    else if (selectedShape == "box") {
        if (lastShape == null) {
            lastShape = screenToWorld(event.clientX, event.clientY);
        }
        else {
            let pattern = "floor";
            if (document.getElementById("floor").checked) {
                pattern = "floor";
            }
            else if (document.getElementById("stone").checked) {
                pattern = "stone";
            }

            world.add(new Box(lastShape[0],
                lastShape[1],
                screenToWorld(event.clientX, event.clientY)[0] - lastShape[0],
                screenToWorld(event.clientX, event.clientY)[1] - lastShape[1],
                pattern
            ));
            lastShape = null;
        }
    }
    else if (selectedShape == "wall") {
        if (lastShape == null) {
            lastShape = screenToWorld(event.clientX, event.clientY);
        }
        else {
            let nowPos = screenToWorld(event.clientX, event.clientY);

            for (let i = lastShape[0]; i < nowPos[0]; i += 25) {
                for (let j = lastShape[1]; j < nowPos[1]; j += 25) {
                    world.add(new Circle([i, j], document.getElementById("isStaticInput").checked, [0, 0.0001], 0.2));
                }
            }
            lastShape = null;
        }
    }
})




let cameraX = 0;
let cameraY = 0;

const cameraSmoothness = 1;



//zoom in
document.getElementById("zoomInBtn").addEventListener("click", function () {
    currentZoom *= ZOOM_FACTOR;
})
document.getElementById("zoomOutBtn").addEventListener("click", function () {
    currentZoom /= ZOOM_FACTOR;
})


// visibility handler
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        pageOutTime = performance.now();
    }
    else {
        pageOutDuration = performance.now() - pageOutTime;
    }
});



// key handler
const keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
});
document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
})




let player = new Circle([canvas.width / 2 - 100, canvas.height / 2]);
player.mass = 1;
player.isPlayer = true;
const world = new World();

top.world = world;

let playerBalls = [
    player,
    // new Circle([canvas.width / 2, canvas.height / 2 + 20], false),
]


playerBalls.forEach(e => world.add(e));
for (let i = 0; i < playerBalls.length - 1; i++) {
    world.add(new Stick(playerBalls[i].id, playerBalls[i + 1].id, Circle.radius * 2));
}


var padding = 25;
world.add(
    new Box(0, 0, 800, padding, "stone"),
    new Box(0, 0, padding, 600, "stone"),
    new Box(800 - padding, 0, padding, 600, "stone"),
    new Box(0, 600 - padding, 800, padding, "stone"),
)
for (let i = canvas.width / 2; i < canvas.width / 2 + 200; i += 40) {
    for (let j = canvas.height / 2; j < canvas.height / 2 + 200; j += 40) {
        let c = new Circle([i, j], undefined, undefined, 0.1, "white")
        c.isEnemy = true;
        world.add(
            c
        )
    }
}


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
const backgroundImage2 = createScaledImageCanvas(textureLoader.getImage("bgday"), 600 / 128);

function drawBackground(xOffset, img) {
    const imageWidth = img.width;
    const imageHeight = img.height;

    // Calculate the effective X position for drawing the background.
    // The modulo operator ensures the position wraps around the image's width,
    // creating a seamless loop.
    // Adding imageWidth before the second modulo handles negative offsets correctly.
    let drawX = (xOffset % imageWidth + imageWidth) % imageWidth;

    // To ensure the entire viewport is covered, we draw multiple copies of the image.
    // We start by drawing the image at its calculated `drawX`.
    // Then, we draw copies to the left and right as needed to fill the screen.
    // This loop ensures coverage regardless of imageWidth vs viewportWidth.
    let currentDrawX = drawX - imageWidth; // Start one image to the left for seamless wrapping

    while (currentDrawX < 800) {
        ctx.drawImage(img, currentDrawX, 0, imageWidth + 2, imageHeight);
        currentDrawX += imageWidth;
    }

}
const floorPattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("floor"), 8), 'repeat');
const stonePattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("stone"), 8), 'repeat');

const draw = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(0, backgroundImage1)

    const targetCameraX = canvas.width / 2 - player.position[0] * currentZoom;
    const targetCameraY = canvas.height / 2 - player.position[1] * currentZoom;
    // cameraX += (targetCameraX - cameraX) * cameraSmoothness;
    // cameraY += (targetCameraY - cameraY) * cameraSmoothness;
    ctx.save();
    ctx.translate(cameraX, cameraY);
    ctx.scale(currentZoom, currentZoom);
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(player.position[0], player.position[1], 60, 0, 2 * Math.PI);
    ctx.stroke();
    world.draw({
        ctx: ctx,
        textureLoader: textureLoader,
        floor: floorPattern,
        player: player,
        canvas: canvas,
        stone: stonePattern
    });

    ctx.restore();
    drawText("black", "14px Arial", "FPS: " + Math.round(fps), 10, 20, ctx);
}


function getClosestBall() {
    const pos = player.position;
    let min_ball = null;
    let min_distance = 70 * 70;
    for (let ball of world.circles) {
        if (ball == player) {
            continue;
        }
        const d = Vector2.distanceSquaredArrays(pos, ball.position);
        if (d < min_distance) {
            min_distance = d;
            min_ball = ball;
        }
    }

    return min_ball;
}

const update = function () {
    // player.acceleration[1] = 0.0001;
    // player.acceleration[0] = 0;

    // if (keys["ArrowUp"] && player.canJump) {
    //     player.canJump = false;
    //     player.position[1] -= 3;
    // }
    // if (keys["ArrowDown"]) {
    //     player.acceleration[1] *= 2
    // }
    // if (keys["ArrowRight"]) {
    //     if (player.position[0] - player.lastPosition[0] < 2) {
    //         player.acceleration[0] = 0.0001
    //     }
    // }
    // if (keys["ArrowLeft"]) {
    //     if (player.position[0] - player.lastPosition[0] > -2) {
    //         player.acceleration[0] = -0.0001
    //     }
    // }
    var speed = 0.15;
    var maxSpeed = 2;
    var yvel = player.position[1] - player.lastPosition[1];
    if (keys["ArrowUp"] || keys["w"]) {
        if (yvel > -maxSpeed) {
            player.position[1] -= speed;
        }
    }
    else if (keys["ArrowDown"] || keys["s"]) {
        if (yvel < maxSpeed) {
            player.position[1] += speed;
        }
    }
    else {
        player.lastPosition[1] = player.lastPosition[1] * 0.9 + player.position[1] * 0.1;
    }

    var xvel = player.position[0] - player.lastPosition[0];
    if (keys["ArrowRight"] || keys["d"]) {
        if (xvel < maxSpeed) {
            player.position[0] += speed;
        }
    }
    else if (keys["ArrowLeft"] || keys["a"]) {
        if (xvel > -maxSpeed) {
            player.position[0] -= speed;
        }
    }
    else {
        player.lastPosition[0] = player.lastPosition[0] * 0.9 + player.position[0] * 0.1;
    }

    if (keys["z"] && (!grapple_active || grapple_stick_ids.length == 0)) {
        grapple_active = true;
        const ball = getClosestBall();
        if (ball) {
            grapple_stick_ids = [new Stick(
                ball.id,
                player.id,
                Vector2.distanceArrays(player.position, ball.position)
            )]
            world.add(...grapple_stick_ids)

        }

    }
    if (!keys["z"]) {
        grapple_active = false;
        for (var stick of grapple_stick_ids) {
            world.removeStick(stick.id);
        }
        grapple_stick_ids = [];
    }

    if (keys["r"]) {
        player.position[0] = canvas.width / 2;
        player.position[1] = canvas.height / 2;
        player.lastPosition[0] = canvas.width / 2;
        player.lastPosition[1] = canvas.height / 2;
    }
    for (let i = 0; i < 1; i++) {
        world.step(deltaTime);
        if (player.position[0] > canvas.width / 2 - player.radius) {
            player.position[0] = canvas.width / 2 - player.radius;
        }
    }
    for (let c of world.circles) {
        if (c.toBeRemoved) {
            world.removeCircle(c.id);
            if (c.isHealth) {
                removeHealthBall(c);
            }
        }
    }

}

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