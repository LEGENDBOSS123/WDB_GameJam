import Circle from "./Circle.mjs";
import Vector2 from "./Vector2.mjs";


export default class Core extends Circle {
    constructor(...args) {
        super(...args);
        this.radius = 100;
        this.isCore = true;
    }

    doCollisionWith(circle) {
        if (super.doCollisionWith(circle)) {
            if (circle.isEnemy || circle.isEnemyBullet) {
                this.toBeRemoved = true;
            }

            if (circle.isFlung) {
                if (Vector2.magnitudeSquaredArray(circle.position) < 150 * 150) {
                    circle.isFlung = false;
                }

            }
            return true;
        }
        return false;
    }
}