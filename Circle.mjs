import Box from "./Box.mjs";
import Vector2 from "./Vector2.mjs"

export default class Circle {
    static radius = 20;
    constructor(position = [0, 0], isStatic = false, acceleration = [0, 0], mass = 1, color = "brown") {
        this.position = position;
        this.lastPosition = [...position]; // This is your previous position for Verlet
        this.acceleration = acceleration;
        this.id = -1;
        this.isStatic = isStatic;
        this.changed = isStatic; // Unsure of purpose, but keeping it
        this.radius = Circle.radius;
        this.mass = mass;
        this.invMass = isStatic ? 0 : 1 / mass; // Inverse mass for impulse calculations
        this.color = color;
        this.restitution = 0; // Added restitution for bouncing effect
        this.toBeRemoved = false;
        this.friction = 1; // Default friction value
    }


    destroy(){

    }

    draw(world, options) {
        const ctx = options.ctx;
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    step(deltaTime) {
        if (this.isStatic) {
            this.lastPosition[0] = this.position[0];
            this.lastPosition[1] = this.position[1];
            return;
        }

        const oldPositionX = this.position[0];
        const oldPositionY = this.position[1];

        this.position[0] = 1.994 * this.position[0] - 0.994 * this.lastPosition[0] + this.acceleration[0] * deltaTime * deltaTime;
        this.position[1] = 1.994 * this.position[1] - 0.994 * this.lastPosition[1] + this.acceleration[1] * deltaTime * deltaTime;

        this.lastPosition[0] = oldPositionX;
        this.lastPosition[1] = oldPositionY;

    }

    doCollisionWith(circle) {
        if (circle instanceof Box) {
            return circle.doCollisionWith(this);
        }

        if (this.isStatic && circle.isStatic) {
            return false; // No collision resolution needed between two static objects
        }

        // Calculate overlap
        const overlapArray = Vector2.subtractArrays(this.position, circle.position);
        const distanceSquared = Vector2.magnitudeSquaredArray(overlapArray);
        const radiusSum = this.radius + circle.radius;

        if (distanceSquared > radiusSum * radiusSum) {
            return false; // No overlap
        }

        const distance = Math.sqrt(distanceSquared);
        const overlap = radiusSum - distance;

        if (distance < 0.0001) { // Prevent division by zero or jitter when objects are perfectly overlapping
            // Push apart slightly if perfectly centered to avoid infinite loops/issues
            const randomAngle = Math.random() * Math.PI * 2;
            const separationVector = [Math.cos(randomAngle), Math.sin(randomAngle)];
            const separationAmount = 0.01; // Small separation to break perfect overlap

            if (!this.isStatic) {
                this.position[0] += separationVector[0] * separationAmount;
                this.position[1] += separationVector[1] * separationAmount;
            }
            if (!circle.isStatic) {
                circle.position[0] -= separationVector[0] * separationAmount;
                circle.position[1] -= separationVector[1] * separationAmount;
            }
            return true; // Still a collision, even if just separating a bit
        }

        const normal = Vector2.scaleArray(overlapArray, 1 / distance); // Normalized separation vector

        // Calculate mass ratios for position correction
        // This distributes the overlap resolution based on inverse mass (or mass directly if only two objects)
        const totalInvMass = this.invMass + circle.invMass;
        let massRatioThis = this.invMass / totalInvMass;
        let massRatioCircle = circle.invMass / totalInvMass;

        // If one object is static, all correction goes to the non-static one
        if (this.isStatic) {
            massRatioThis = 0;
            massRatioCircle = 1;
        } else if (circle.isStatic) {
            massRatioThis = 1;
            massRatioCircle = 0;
        }

        const relax = 1; // Factor to apply a fraction of the overlap correction (can help with stability)

        // 1. Position Correction (resolving interpenetration)
        this.position[0] += normal[0] * overlap * massRatioThis * relax;
        this.position[1] += normal[1] * overlap * massRatioThis * relax;
        circle.position[0] -= normal[0] * overlap * massRatioCircle * relax;
        circle.position[1] -= normal[1] * overlap * massRatioCircle * relax;

        // --- Start of Friction and Restitution ---

        // Get the relative velocity *before* friction and restitution (but after position correction)
        // This is derived from the current position and the lastPosition (Verlet's implicit velocity)
        const v1 = Vector2.subtractArrays(this.position, this.lastPosition);
        const v2 = Vector2.subtractArrays(circle.position, circle.lastPosition);
        const relativeVelocity = Vector2.subtractArrays(v1, v2);

        // Calculate the relative velocity along the normal (for restitution)
        const vn = Vector2.dot(relativeVelocity, normal);

        // If objects are moving away from each other, no further impulse needed
        if (vn > 0) {
            return true;
        }

        // Calculate impulse along the normal (for restitution/bouncing)
        const restitution = (this.restitution + circle.restitution) / 2;
        const jn = -(1 + restitution) * vn / totalInvMass;

        // Apply normal impulse (changes 'lastPosition' to affect next frame's velocity)
        if (!this.isStatic) {
            this.lastPosition[0] -= normal[0] * jn * this.invMass;
            this.lastPosition[1] -= normal[1] * jn * this.invMass;
        }
        if (!circle.isStatic) {
            circle.lastPosition[0] += normal[0] * jn * circle.invMass;
            circle.lastPosition[1] += normal[1] * jn * circle.invMass;
        }

        // --- Friction (after normal impulse) ---

        // Recalculate relative velocity after normal impulse (important!)
        // This reflects the new velocities after the bounce.
        const v1_post_normal = Vector2.subtractArrays(this.position, this.lastPosition);
        const v2_post_normal = Vector2.subtractArrays(circle.position, circle.lastPosition);
        const relativeVelocity_post_normal = Vector2.subtractArrays(v1_post_normal, v2_post_normal);

        // Get the tangential direction
        const tangent = [-normal[1], normal[0]]; // Rotate normal by 90 degrees

        // Get the relative velocity along the tangent
        const vt = Vector2.dot(relativeVelocity_post_normal, tangent);

        // Calculate tangential impulse to stop motion
        const jt = -vt / totalInvMass;

        // Calculate maximum friction impulse based on normal impulse and friction coefficients
        const combinedFriction = (this.friction + circle.friction) / 2;
        const maxFrictionImpulse = combinedFriction * jn; // Use the magnitude of the normal impulse

        let frictionImpulse;

        // Static vs. Kinetic Friction
        if (Math.abs(jt) < maxFrictionImpulse) {
            // Static friction: apply just enough impulse to stop tangential motion
            frictionImpulse = jt;
        } else {
            // Kinetic friction: apply max friction impulse in the opposite direction of tangential motion
            frictionImpulse = -maxFrictionImpulse * Math.sign(vt);
        }

        // Apply friction impulse (adjusting 'lastPosition')
        if (!this.isStatic) {
            this.lastPosition[0] -= tangent[0] * frictionImpulse * this.invMass;
            this.lastPosition[1] -= tangent[1] * frictionImpulse * this.invMass;
        }
        if (!circle.isStatic) {
            circle.lastPosition[0] += tangent[0] * frictionImpulse * circle.invMass;
            circle.lastPosition[1] += tangent[1] * frictionImpulse * circle.invMass;
        }


        return true;
    }

    toJSON() {
        return {
            position: this.position,
            isStatic: this.isStatic,
            radius: this.radius,
            id: this.id,
            color: this.color,
            mass: this.mass,
            restitution: this.restitution,
            friction: this.friction
        }
    }

    static fromJSON(json) {
        const circle = new Circle(json.position, json.isStatic, [0, 0], json.mass, json.color);
        circle.radius = json.radius;
        circle.id = json.id;
        circle.restitution = json.restitution;
        circle.friction = json.friction;
        circle.lastPosition = [...json.position]; // Ensure lastPosition is initialized from current position
        return circle;
    }
}