import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import SoundManager from "./SoundManager.mjs";
import Stick from "./Stick.mjs";
import World from "./World.mjs";
import Vector2 from "./Vector2.mjs";
import TextureLoader from "./TextureLoader.mjs";
import startGame from "./startGame.mjs";
import menuScreen from "./menuScreen.mjs";
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


let upgrades = {
    shieldBallCount: 100,
    throwCount: 1,
    regenerateCount: 1,
    shieldDamage: 1
}

let game = {
    money: 0,
    upgrades: upgrades,
    highscore: 0,
    textureLoader: textureLoader,
    soundManager: soundManager,
    canvas: canvas,
    ctx: ctx,
    score: 0,
    wave: 1
}






while(true){
    await menuScreen(game);
    await startGame(game);
}









