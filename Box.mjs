import Vector2 from "./Vector2.mjs";

export default class Box {
    constructor(x, y, width, height, patternName = "floor") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.patternName = patternName;
    }

    draw(world, options) {
        const ctx = options.ctx;

        ctx.fillStyle = options[this.patternName];
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawLayer2(world, options) {
        const ctx = options.ctx;

        ctx.fillStyle = options[this.patternName];
        ctx.globalAlpha = 0.4;
        ctx.translate(this.x + (options.player.position[0] - this.x - this.width / 2) * 0.035, 0);
        ctx.fillRect(0, this.y - Math.min(10, this.height * 0.05), this.width, this.height);
        ctx.translate(-(this.x + (options.player.position[0] - this.x - this.width / 2) * 0.035), 0);
        ctx.globalAlpha = 1;
    }

    doCollisionWith(circle) {
        // Ensure 'this' is a Box and 'circle' is a Circle (good practice for robust code)
        // if (!(this instanceof Box) || !(circle instanceof Circle)) { return false; }

        // 1. Find the closest point on the Box to the Circle's center
        const closestX = Math.max(this.x, Math.min(circle.position[0], this.x + this.width));
        const closestY = Math.max(this.y, Math.min(circle.position[1], this.y + this.height));

        // 2. Calculate vector from closest point on Box to Circle's center
        const deltaX = circle.position[0] - closestX;
        const deltaY = circle.position[1] - closestY;

        // 3. Calculate squared distance
        const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);
        const radiusSquared = circle.radius * circle.radius;

        // 4. Check for collision
        if (distanceSquared > radiusSquared) {
            return false; // No collision
        }

        // 5. Handle special case: Circle center is exactly on the closest point (e.g., inside the box)
        if (distanceSquared < 0.0001) { // Using a small epsilon instead of exactly 0 for floating point safety
            // This means the circle's center is very close to or on the closest point of the box.
            // For a general physics engine, this case requires more robust handling to find a normal.
            // For a platformer where you want it to sit on top, this can be a specific fix.
            // We'll apply a default upward normal for restitution in this specific case,
            // effectively treating it as a top collision.
            circle.position[1] = this.y - circle.radius - 0.01; // Nudge out slightly more
            const defaultNormal = [0, -1]; // Assuming collision from top
            const impulseMagnitude = -(1 + circle.restitution) * Vector2.dot(Vector2.subtractArrays(circle.position, circle.lastPosition), defaultNormal) * circle.mass;
            circle.lastPosition[0] -= defaultNormal[0] * impulseMagnitude / circle.mass;
            circle.lastPosition[1] -= defaultNormal[1] * impulseMagnitude / circle.mass;
            circle.canJump = true; // Likely can jump after landing
            return true;
        }

        const distance = Math.sqrt(distanceSquared);
        const overlap = circle.radius - distance;

        // 6. Calculate collision normal (direction from closest point on Box to Circle's center)
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const normal = [normalX, normalY]; // Use Vector2 as array for consistent operations

        // --- Positional Correction (for the circle) ---
        // Since the box is assumed static, the circle moves the full overlap
        

        // --- Velocity Adjustment (Adding Restitution) ---

        // 1. Calculate the circle's current velocity (implicitly from Verlet positions)
        const velocityCircle = Vector2.subtractArrays(circle.position, circle.lastPosition);

        // 2. Calculate the velocity of the circle along the collision normal
        const velAlongNormal = Vector2.dot(velocityCircle, normal);

        // If the circle is already moving away from the box, no impulse needed
        if (velAlongNormal > 0) {
            return true;
        }

        // 3. Get restitution value from the circle (or a global constant)
        // Assume circle has a 'restitution' property (e.g., circle.restitution = 0.6)
        const restitution = circle.restitution !== undefined ? circle.restitution : 1; // Default to 0.6 if not set

        // 4. Calculate the impulse scalar (since the box is static, its mass is infinite)
        // Formula: j = -(1 + e) * v_rel_normal * mass_dynamic_object
        const impulseScalar = -(1 + restitution) * velAlongNormal * circle.mass;

        // 5. Apply the impulse to the circle's LAST_POSITION to change its effective velocity
        // This is the core of adding restitution in Verlet.
        circle.lastPosition[0] -= normal[0] * impulseScalar / circle.mass;
        circle.lastPosition[1] -= normal[1] * impulseScalar / circle.mass;
        circle.position[0] += normal[0] * overlap;
        circle.position[1] += normal[1] * overlap;
        circle.lastPosition[0] += normal[0] * overlap;
        circle.lastPosition[1] += normal[1] * overlap;

        // --- CanJump Logic ---
        // Check if the circle is sitting on top of the box (normalY points strongly downwards)
        // A small tolerance (e.g., -0.8) is good to account for slight angles.
        if (normal[1] < -0.8) {
            circle.canJump = true;
        }

        return true; // Collision occurred and was resolved
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            patternName: this.patternName
        }
    }

    static fromJSON(json) {
        return new Box(
            json.x,
            json.y,
            json.width,
            json.height,
            json.patternName
        )
    }
}