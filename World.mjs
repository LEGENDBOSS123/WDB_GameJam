import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import Hashmap from "./Hashmap.mjs";
import Stick from "./Stick.mjs";

export default class World {

    constructor() {
        this.circles = [];
        this.sticks = [];
        this.all = {};
        this.maxId = 0;
        this.hashmap = new Hashmap();
        this.staticHashMap = new Hashmap();
        this.pairs = new Map();
        this.boxes = [];
    }

    addPair(circle1, circle2, _this) {
        if(circle1.toBeRemoved || circle2.toBeRemoved){
            return;
        }
        if (circle1.id > circle2.id) {
            _this.pairs.set(circle2.id + "," + circle1.id, [circle2, circle1]);
        }
        else {
            _this.pairs.set(circle1.id + "," + circle2.id, [circle1, circle2]);
        }
    }

    removeStick(id){
        if(!this.all[id]){
            return;
        }
        for(let i = this.sticks.length - 1; i >= 0; i--){
            if(this.sticks[i].id == id){
                this.sticks.splice(i, 1);
            }
        }
        this.all[id] = null;
        delete this.all[id];
    }

    removeCircle(id){
        if(!this.all[id]){
            return;
        }
        for(let i = this.circles.length - 1; i >= 0; i--){
            if(this.circles[i].id == id){
                this.circles.splice(i, 1);
            }
        }
        this.all[id].id = -1;
        this.all[id] = null;
        delete this.all[id];
    }

    add() {
        for(let obj of arguments){
            obj.id = this.maxId++;
            this.all[obj.id] = obj;
            if (obj instanceof Circle) {
                this.circles.push(obj);
            }
            else if (obj instanceof Stick) {
                this.sticks.push(obj);
            }
            else if (obj instanceof Box) {
                this.boxes.push(obj);
            }
        }
    }

    draw(o) {
        for (let id in this.all) {
            this.all[id].drawLayer2?.(this, o);
        }
        for (let id in this.all) {
            this.all[id].draw(this, o);
        }
    }

    step(deltaTime) {
        for (let c of this.circles){
            if(c.toBeRemoved){
                this.removeCircle(c.id);
            }
        }
        this.pairs.clear();
        this.hashmap.clear();
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].step(deltaTime);
        }

        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < this.sticks.length; i++) {
                this.sticks[i].step(this);
            }
        }

        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].isStatic) {
                if (this.circles[i].changed) {
                    this.staticHashMap.insert(this.circles[i]);
                    this.circles[i].changed = false;
                }
                continue;
            }
            this.hashmap.insert(this.circles[i]);
        }

        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].isStatic) {
                continue;
            }

            this.hashmap.query(this.circles[i], this.addPair, this);
            this.staticHashMap.query(this.circles[i], this.addPair, this);
        }

        for (let i = 0; i < this.boxes.length; i++) {
            for (let j = 0; j < this.circles.length; j++) {
                const c = this.circles[j];
                const b = this.boxes[i];
                if (c.isStatic) {
                    continue;
                }
                this.addPair(c, b, this)
            }
        }

        for (let [key, value] of this.pairs) {
            value[0].doCollisionWith(value[1]);
        }
    }


    toJSON() {
        const json = {
            circles: [],
            sticks: [],
            boxes: []
        };


        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].isPlayer) {
                continue;
            }
            json.circles.push(this.circles[i].toJSON());
        }
        for (let i = 0; i < this.sticks.length; i++) {
            json.sticks.push(this.sticks[i].toJSON());
        }
        for (let i = 0; i < this.boxes.length; i++) {
            json.boxes.push(this.boxes[i].toJSON());
        }

        return json;
    }

    parseJSON(json) {
        if (!json.circles) {
            return;
        }
        const all = {}
        for (let i = 0; i < json.circles.length; i++) {
            const circle = Circle.fromJSON(json.circles[i]);
            all[circle.id] = circle;
            if (!circle.isStatic) {
                circle.acceleration[1] = 0.0001
            }
            this.add(circle);
        }
        for (let i = 0; i < json.boxes.length; i++) {
            this.add(Box.fromJSON(json.boxes[i]));
        }
        for (let i = 0; i < json.sticks.length; i++) {
            const stick = Stick.fromJSON(json.sticks[i]);
            stick.id1 = all[stick.id1].id;
            stick.id2 = all[stick.id2].id;
            this.add(stick);
        }
    }
}