/**
 * 2D Vector class for mathematical operations
 */
export class Vec2 {
    constructor(public x: number, public y: number) { }

    /**
     * Rotate the vector by a given angle in radians
     * @param rad Angle in radians
     * @returns New rotated Vec2
     */
    rot(rad: number): Vec2 {
        return new Vec2(
            this.x * Math.cos(rad) - this.y * Math.sin(rad),
            this.x * Math.sin(rad) + this.y * Math.cos(rad)
        );
    }

    /**
     * Add another vector to this vector
     * @param v Vector to add
     * @returns New Vec2 with sum
     */
    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    /**
     * Multiply the vector by a scalar
     * @param s Scalar value
     * @returns New scaled Vec2
     */
    mult(s: number): Vec2 {
        return new Vec2(this.x * s, this.y * s);
    }
}
