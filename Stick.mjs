import Vector2 from "./Vector2.mjs";

export default class Stick {
    constructor(id1, id2, distance) {
        this.id1 = id1;
        this.id2 = id2;
        this.id = -1;
        this.distance = distance;
    }

    step(world) {
        const circle1 = world.all[this.id1];
        const circle2 = world.all[this.id2];
        const overlapArray = Vector2.subtractArrays(circle1.position, circle2.position);
        const distance = Math.sqrt(Vector2.magnitudeSquaredArray(overlapArray));

        const correctionRatio = (distance - this.distance) / distance;
        const correction = Vector2.normalizeArray(overlapArray);
        const totalMass = circle1.mass + circle2.mass;
        let massRatio = circle2.mass / totalMass;
        if(circle1.isStatic){
            massRatio = 0;
        }
        else if(circle2.isStatic){
            massRatio = 1;
        }
        correction[0] *= correctionRatio * 2;
        correction[1] *= correctionRatio * 2;
        circle1.position[0] -= correction[0] * massRatio;
        circle1.position[1] -= correction[1] * massRatio;
        circle2.position[0] += correction[0] * (1 - massRatio);
        circle2.position[1] += correction[1] * (1 - massRatio);
    }


    draw(world, options) {
        const ctx = options.ctx;
        ctx.beginPath();
        ctx.moveTo(world.all[this.id1].position[0], world.all[this.id1].position[1]);
        ctx.lineTo(world.all[this.id2].position[0], world.all[this.id2].position[1]);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    toJSON(){
        return {
            id1: this.id1,
            id2: this.id2,
            distance: this.distance
        }
    }

    static fromJSON(json){
        return new Stick(json.id1, json.id2, json.distance);
    }
}