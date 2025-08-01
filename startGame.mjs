import Circle from "./Circle.mjs";
import Core from "./Core.mjs";
import Enemy from "./Enemy.mjs";
import Shield from "./Shield.mjs";
import World from "./World.mjs"
import shieldPos from "./shieldPos.mjs";

let currentZoom = 0.2;



let cameraX = 0;
let cameraY = 0;
const cameraSmoothness = 0.1;



let ctx = 0;
let canvas = 0;

let tps = 60;
let deltaTime = 1000 / tps;


let mouse = [0, 0];
document.onmousemove = function (event) {
    mouse = screenToWorld(event.clientX, event.clientY);
};


document.onvisibilitychange = function () {
    if (document.hidden) {
        pageOutTime = performance.now();
    }
    else {
        pageOutDuration = performance.now() - pageOutTime;
    }
};


const keys = {};
document.onkeydown = function (event) {
    keys[event.key] = true;
};
document.onkeyup = function (event) {
    keys[event.key] = false;
};




function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();

    const ratioX = (clientX - rect.left) / rect.width;
    const ratioY = (clientY - rect.top) / rect.height;

    const worldX = (ratioX * 800 - cameraX) / currentZoom;
    const worldY = (ratioY * 600 - cameraY) / currentZoom;
    return [worldX, worldY];
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

const drawText = function (color, font, text, x, y, ctx) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

let frameCount = 0;
let fps = 0;
let lastSecondTime = 0;
let pageOutTime = 0;
let pageOutDuration = 0;


export default function (game) {
    return new Promise(resolve => {
        frameCount = 0;
        fps = 0;
        lastSecondTime = 0;
        pageOutTime = 0;
        pageOutDuration = 0;
        ctx = game.ctx;
        canvas = game.canvas;
        const textureLoader = game.textureLoader;
        const soundManager = game.soundManager;
        const upgrades = game.upgrades;

        top.game = game;
        const world = new World();
        top.world = world;

        const floorPattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("floor"), 8), 'repeat');
        const stonePattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("stone"), 8), 'repeat');
        const backgroundImage1Pattern = ctx.createPattern(createScaledImageCanvas(textureLoader.getImage("floor"), 100), 'repeat');

        let regenerateCooldownNow = 0;
        let regenerateCooldown = 5000;

        const core = new Core([0, 0], true, undefined, 1, "white");
        world.add(core);


        for (let i = 0; i < 1; i++) {
            const enemy = new Enemy();
            world.add(enemy);
        }

        let configureShield = function (s) {
            s.damage = upgrades.shieldDamage;

            return s;
        }

        for (let i = 0; i < Math.min(upgrades.shieldBallCount, shieldPos.length); i++) {
            let c = new Shield([(shieldPos[i][0] - canvas.width * 0.5) * 3, (shieldPos[i][1] - canvas.height * 0.5) * 3], undefined, undefined, 1, "orange")
            configureShield(c);
            world.add(c);
        }


        const regenerate = function () {
            var angle = Math.random() * Math.PI * 2;
            var distance = 3000;
            var x = distance * Math.cos(angle);
            var y = distance * Math.sin(angle);
            var c = new Shield([x, y], undefined, undefined, 1, "orange")
            configureShield(c);
            world.add(c);
        }
        const draw = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = backgroundImage1Pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const targetCameraX = canvas.width / 2 - core.position[0] * currentZoom - mouse[0] * 0.007;
            const targetCameraY = canvas.height / 2 - core.position[1] * currentZoom - mouse[1] * 0.007;
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
            drawText("white", "14px Arial", "FPS: " + Math.round(fps), 10, 20, ctx);
        }


        const getNnearestShieldBalls = function (n, posx, posy, y = false) {

            const x = [];

            for (let circle of world.circles) {
                if (circle.isShield) {
                    if (y && circle.isFlung) {
                        continue;
                    }
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
        let nowTime = performance.now();
        let accumulatedTime = 0;
        let lastFrameTime = performance.now();
        const update = function () {
            for (let i = 0; i < 1; i++) {
                world.step(deltaTime);
            }
            let needed = upgrades.shieldBallCount;
            for (let circle of world.circles) {
                if (circle.isShield) {
                    needed--;
                    const dx = - circle.position[0];
                    const dy = - circle.position[1];
                    const distanceSquared = dx * dx + dy * dy;
                    const distance = Math.sqrt(distanceSquared);
                    if (distance < 0.0001) {
                        continue;
                    }
                    let gConstant = 0.05;
                    if (distance < 200) {
                        gConstant = 0.01;
                    }
                    const force = gConstant * circle.mass / Math.pow(distance, 1.5);
                    const ax = dx * force;
                    const ay = dy * force;
                    circle.acceleration[0] = ax;
                    circle.acceleration[1] = ay;
                    circle.color = "orange";


                }
            }
            selectedBalls = [];
            for (let circle of getNnearestShieldBalls(upgrades.throwCount, mouse[0], mouse[1], true)) {
                circle.color = "red";
                selectedBalls.push(circle);
            }
            if (performance.now() - regenerateCooldownNow > regenerateCooldown) {
                for (let i = 0; i < Math.min(upgrades.regenerateCount, needed); i++) {
                    regenerate();
                }
                regenerateCooldownNow = performance.now();
            }
        }



        canvas.onclick = function () {
            if (selectedBalls == []) {
                return;
            }
            let average = [0, 0];
            for (let c of selectedBalls) {
                c.isFlung = true;
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
            let force = 50;
            for (let c of selectedBalls) {

                c.position[0] += ndx * force;
                c.position[1] += ndy * force;

            }
        };


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

            if (core.id != -1) {

                requestAnimationFrame(animate);
            }
            else {
                top.game.soundManager.play("explosion");
                resolve();
            }
        }

        animate();
    });
};