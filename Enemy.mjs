import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import EnemyBullet from "./EnemyBullet.mjs";
import Vector2 from "./Vector2.mjs"

export default class Enemy extends Circle {
    static radius = 10;
    constructor(radius = 100) {
        super();
        this.radius = radius;
        this.angularVelocity = 0.003;
        this.angle = Math.random() * Math.PI * 2;
        this.distance = 2000;
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
    }

    spawnBullet(){
        let angle = Math.random() * Math.PI * 2;
        let distance = this.radius + 50;
        let x = this.position[0] + distance * Math.cos(angle);
        let y = this.position[1] + distance * Math.sin(angle);
        let c = new EnemyBullet([x, y], undefined, undefined, 1, "brown")
        c.lastPosition[0] -= Math.cos(angle) * 5;
        c.lastPosition[1] -= Math.sin(angle) * 5;
        world.add(c);
    }

    
    step(deltaTime) {
        super.step(deltaTime);
        this.position[0] = this.distance * Math.cos(this.angle);
        this.position[1] = this.distance * Math.sin(this.angle);
        this.angle += this.angularVelocity;
        this.distance = Math.max(this.distance - 1, 0);
        this.color = `rgb(255, ${this.health / this.maxHealth * 255}, 0)`
        this.lastSpawnBullet -= 1;
        if (this.lastSpawnBullet <= 0) {
            this.lastSpawnBullet = this.timeUntilBulletSpawn;
            for(let i  = 0; i , i < this.bulletNumber; i++){
                this.spawnBullet();
            }
        }

    }

    doCollisionWith(circle) {
        if (super.doCollisionWith(circle)) {
            if (circle.isShield) {
                this.health -= circle.damage;
                circle.toBeRemoved = true;
            }
            if (this.health <= 0) {
                this.toBeRemoved = true;
            }
            
            return true;
        }
        return false;
    }

}

