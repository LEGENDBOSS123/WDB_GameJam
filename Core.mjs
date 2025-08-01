import Circle from "./Circle.mjs";


export default class Core extends Circle {
    constructor(...args) {
        super(...args);
        this.radius = 100;
        this.isCore = true;
    }

    doCollisionWith(circle) {
        if (super.doCollisionWith(circle)) {
            if(circle.isEnemy || circle.isEnemyBullet){
                this.toBeRemoved = true;
            }

            return true;
        }
        return false;
    }
}