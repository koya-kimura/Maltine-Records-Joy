import p5 from 'p5';
import { Vec2 } from '../../util/Vec2';
import { isOutOfBounds } from '../../util/mathUtils';
import { JoyConManager } from '../../joycon/JoyConManager';

/**
 * Car class representing the player's vehicle
 * Position is stored in normalized coordinates [0, 1]
 */
export class Car {
    private x: number = 0.5;
    private y: number = 0.5;
    private z: number = 0;
    private vz: number = 0;
    private isJumping: boolean = false;
    private moveSpeed: number = 0.002;
    private viewDistance: number = 0.05;
    public angle: number = 0;

    constructor(private p: p5) { }

    /**
     * Update car state based on keyboard input
     */
    update(joycon: JoyConManager): void {
        const viewFrontX = this.x + Math.cos(this.angle) * this.viewDistance;
        const viewFrontY = this.y + Math.sin(this.angle) * this.viewDistance;

        const viewBackX = this.x + Math.cos(this.angle + Math.PI) * this.viewDistance;
        const viewBackY = this.y + Math.sin(this.angle + Math.PI) * this.viewDistance;

        // Rotation controls
        if (joycon.isPressed("L")) {
            this.angle += 0.01;
        }
        if (joycon.isPressed("R")) {
            this.angle -= 0.01;
        }

        // Movement controls with boundary checking
        if (joycon.isPressed("A") && !isOutOfBounds(viewFrontX, viewFrontY)) {
            this.x += Math.cos(this.angle) * this.moveSpeed;
            this.y += Math.sin(this.angle) * this.moveSpeed;
        }
        if (joycon.isPressed("B") && !isOutOfBounds(viewBackX, viewBackY)) {
            this.x += Math.cos(this.angle + Math.PI) * this.moveSpeed;
            this.y += Math.sin(this.angle + Math.PI) * this.moveSpeed;
        }

        if (joycon.isJustPressed("ZR") && !this.isJumping) {
            this.vz = 0.01;
            this.isJumping = true;
        }
        if (this.isJumping) {
            this.z += this.vz;
            this.vz -= 0.001;
            if (this.z <= 0) {
                this.z = 0;
                this.isJumping = false;
            }
        }
    }

    /**
     * Draw the car (for debugging purposes)
     * @param graphics Graphics context to draw on
     */
    draw(graphics: p5.Graphics): void {
        const x = this.x * graphics.width;
        const y = this.y * graphics.height;

        const vfx = (this.x + Math.cos(this.angle) * this.viewDistance) * graphics.width;
        const vfy = (this.y + Math.sin(this.angle) * this.viewDistance) * graphics.height;

        graphics.push();
        graphics.rectMode(this.p.CENTER);
        graphics.translate(x, y);
        graphics.rotate(this.angle);
        graphics.fill(255, 0, 0);
        graphics.rect(0, 0, 20);
        graphics.pop();

        graphics.stroke(255);
        graphics.line(x, y, vfx, vfy);
    }

    /**
     * Get the car's position as a Vec2
     * @returns Position vector
     */
    getPosition(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    /**
     * Get the car's angle
     * @returns Angle in radians
     */
    getAngle(): number {
        return this.angle;
    }

    /**
     * Get the car's z position
     * @returns Z position
     */
    getZ(): number {
        return this.z;
    }
}
