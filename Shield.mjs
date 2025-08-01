import Circle from "./Circle.mjs";
import Vector2 from "./Vector2.mjs";

export default class Shield extends Circle {
    constructor(...args) {
        super(...args);
        this.isShield = true;
        this.damage = 1;
        this.radius = 10;
    }

    doCollisionWith(circle) {
        if (super.doCollisionWith(circle)) {
            if(circle.isEnemy || circle.isEnemyBullet){
                circle.health -= this.damage;
                this.toBeRemoved = true;
                
            }
            if (this.isFlung || circle.isFlung) {
                if (Vector2.magnitudeSquaredArray(this.position) < 150 * 150 || Vector2.magnitudeSquaredArray(circle.position) < 150 * 150) {
                    this.isFlung = false;
                    circle.isFlung = false;
                }

            }
            return true;
        }
        return false;
    }
}