import Circle from "./Circle.mjs";
import Vector2 from "./Vector2.mjs";

export default class Hashmap {
    static prime1 = 73856093;
    static prime2 = 19349669;
    constructor() {
        this.cellSize = Circle.radius;
        this.inverseCellSize = 1 / this.cellSize;
        this.grid = new Map();
    }

    toCellCoords(array) {
        return [Math.floor(array[0] * this.inverseCellSize), Math.floor(array[1] * this.inverseCellSize)];
    }

    clear() {
        this.grid.clear();
    }

    insert(circle) {
        const min = this.toCellCoords(Vector2.subtractArrays(circle.position, [circle.radius, circle.radius]));
        const max = this.toCellCoords(Vector2.addArrays(circle.position, [circle.radius, circle.radius]));
        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                const key = this.hash([x, y]);
                if(!this.grid.has(key)){
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(circle);
            }
        }
    }

    hash(array) {
        return `${array[0]},${array[1]}`;
    }

    query(circle, addPair, _this) {
        const min = this.toCellCoords(Vector2.subtractArrays(circle.position, [circle.radius, circle.radius]));
        const max = this.toCellCoords(Vector2.addArrays(circle.position, [circle.radius, circle.radius]));
        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                const key = this.hash([x, y]);
                if(this.grid.has(key)){
                    const circles = this.grid.get(key);
                    for(const c of circles){
                        if(c.toBeRemoved){
                            circles.splice(circles.indexOf(c), 1);
                            continue;
                        }
                        if(c !== circle){
                            addPair(circle, c, _this);
                        }
                    }
                }
            }
        }
    }
}