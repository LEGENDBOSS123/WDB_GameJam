import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import EnemyBullet from "./EnemyBullet.mjs";
import Vector2 from "./Vector2.mjs"

export default class Enemy extends Circle {
    static radius = 10;
    constructor(radius = 100, distance = 2000, angle = 0) {
        super();
        this.radius = radius;
        this.angularVelocity = 0.003;
        this.angle = angle;
        this.distance = distance;
        this.position = [
            this.distance * Math.cos(this.angle),
            this.distance * Math.sin(this.angle)
        ]
        this.lastPosition = [...this.position];
        this.color = "rgb(255, 0, 0)";
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.isEnemy = true;
        this.timeUntilBulletSpawn = 300;
        this.lastSpawnBullet = this.timeUntilBulletSpawn;
        this.bulletNumber = 1;
        this.inwardsVelocity = 0.5;
        this.deathBulletCount = 3;
        this.cashValue = 100;
    }

    draw(world, options){
        const ctx = options.ctx;
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 12;
        ctx.stroke();
    }

    spawnBullet() {
        let angle = Math.random() * Math.PI * 2;
        let distance = this.radius + 50;
        let x = this.position[0] + distance * Math.cos(angle);
        let y = this.position[1] + distance * Math.sin(angle);
        let c = new EnemyBullet([x, y], undefined, undefined, 1, "brown")
        c.lastPosition[0] -= Math.cos(angle) * 5;
        c.lastPosition[1] -= Math.sin(angle) * 5;
        top.world.add(c);
    }


    step(deltaTime) {
        super.step(deltaTime);
        this.position[0] = this.distance * Math.cos(this.angle);
        this.position[1] = this.distance * Math.sin(this.angle);
        this.angle += this.angularVelocity;
        this.distance = Math.max(this.distance - this.inwardsVelocity, 0);
        this.color = `rgb(255, ${this.health / this.maxHealth * 255}, 0)`
        this.lastSpawnBullet -= 1;
        if (this.lastSpawnBullet <= 0) {
            this.lastSpawnBullet = this.timeUntilBulletSpawn;
            for (let i = 0; i, i < this.bulletNumber; i++) {
                this.spawnBullet();
            }
        }

        if (this.health <= 0) {
            this.toBeRemoved = true;
            this.ondeath();
        }

    }

    ondeath() {
        for (let i = 0; i < this.deathBulletCount; i++) {
            this.spawnBullet();
        }
        top.game.money += this.cashValue;
        top.game.soundManager.play("explosion");
    }

    doCollisionWith(circle) {
        if (super.doCollisionWith(circle)) {
            if (circle.isShield) {
                this.health -= circle.damage;
                circle.toBeRemoved = true;
            }

            return true;
        }
        return false;
    }

}

