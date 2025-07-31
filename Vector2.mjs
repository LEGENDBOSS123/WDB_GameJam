export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this vector and returns a new Vector2.
     * @param {Vector2} vector The vector to add.
     * @returns {Vector2} A new Vector2 representing the sum.
     */
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    /**
     * Subtracts another vector from this vector and returns a new Vector2.
     * @param {Vector2} vector The vector to subtract.
     * @returns {Vector2} A new Vector2 representing the difference.
     */
    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    /**
     * Multiplies this vector by another vector (component-wise) and returns a new Vector2.
     * @param {Vector2} vector The vector to multiply by.
     * @returns {Vector2} A new Vector2 representing the component-wise product.
     */
    multiply(vector) {
        return new Vector2(this.x * vector.x, this.y * vector.y);
    }

    /**
     * Scales this vector by a scalar value and returns a new Vector2.
     * @param {number} scalar The scalar value to multiply by.
     * @returns {Vector2} A new Vector2 representing the scaled vector.
     */
    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    // --- In-Place Arithmetic Operations (Modify This Vector2) ---

    /**
     * Adds another vector to this vector (in-place).
     * @param {Vector2} vector The vector to add.
     * @returns {Vector2} This Vector2 instance, after modification.
     */
    addInPlace(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this; // Return 'this' for chaining
    }

    /**
     * Subtracts another vector from this vector (in-place).
     * @param {Vector2} vector The vector to subtract.
     * @returns {Vector2} This Vector2 instance, after modification.
     */
    subtractInPlace(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Multiplies this vector by another vector (component-wise, in-place).
     * @param {Vector2} vector The vector to multiply by.
     * @returns {Vector2} This Vector2 instance, after modification.
     */
    multiplyInPlace(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    }

    /**
     * Scales this vector by a scalar value (in-place).
     * @param {number} scalar The scalar value to multiply by.
     * @returns {Vector2} This Vector2 instance, after modification.
     */
    scaleInPlace(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // --- Vector Specific Operations ---

    /**
     * Calculates the dot product of this vector and another vector.
     * @param {Vector2} vector The other vector.
     * @returns {number} The dot product.
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Calculates the 2D cross product (Z-component of the 3D cross product) of this vector and another vector.
     * In 2D, this is `a.x * b.y - a.y * b.x`. It represents the signed magnitude of the area of the parallelogram
     * formed by the two vectors, and indicates the orientation.
     * @param {Vector2} vector The other vector.
     * @returns {number} The 2D cross product.
     */
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    // --- Utility (Optional but often useful) ---

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude of the vector.
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculates the squared magnitude (length squared) of the vector.
     * Useful for comparisons as it avoids the expensive square root operation.
     * @returns {number} The squared magnitude of the vector.
     */
    magnitudeSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalizes this vector (makes its magnitude 1) and returns a new Vector2.
     * Returns a zero vector if the current vector has zero magnitude.
     * @returns {Vector2} A new Vector2 representing the normalized vector.
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2(0, 0);
        }
        return new Vector2(this.x / mag, this.y / mag);
    }

    /**
     * Normalizes this vector (makes its magnitude 1) in-place.
     * @returns {Vector2} This Vector2 instance, after modification.
     */
    normalizeInPlace() {
        const mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    /**
     * Returns a string representation of the vector.
     * @returns {string} A string like "Vector2(x, y)".
     */
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }

    /**
     * Creates a copy of this vector.
     * @returns {Vector2} A new Vector2 instance with the same x and y values.
     */
    copy() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Sets the x and y values of this vector using another vector.
     * @param {Vector2} vector The vector whose values are to be copied.
     */
    set(vector) {

        this.x = vector.x;
        this.y = vector.y;
    }

    /**
     * Sets the x and y values of this vector directly.
     * @param {number} x The x value to set.
     * @param {number} y The y value to set.
     */
    setXY(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Iterator interface for accessing the x and y values of the vector.
     * @returns {[number, number]}
     */
    [Symbol.iterator]() {
        return [this.x, this.y];
    }

    static distanceArrays(a, a2){
        return Math.sqrt((a[0] - a2[0]) * (a[0] - a2[0]) + (a[1] - a2[1]) * (a[1] - a2[1]));
    }

    static magnitudeSquaredArray(a){
        return a[0] * a[0] + a[1] * a[1];
    }

    static distanceSquaredArrays(a, a2){
        return (a[0] - a2[0]) * (a[0] - a2[0]) + (a[1] - a2[1]) * (a[1] - a2[1]);
    }

    static normalizeArray(a){
        const mag = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
        return [a[0] / mag, a[1] / mag];
    }

    static subtractArrays(a, a2){
        return [a[0] - a2[0], a[1] - a2[1]];
    }

    static addArrays(a, a2){
        return [a[0] + a2[0], a[1] + a2[1]];
    }

    static scaleArray(a, s){
        return [a[0] * s, a[1] * s];
    }

    static normalizeArray(a){
        const mag = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
        return [a[0] / mag, a[1] / mag];
    }

    static dot(a, a2){
        return a[0] * a2[0] + a[1] * a2[1];
    }
};