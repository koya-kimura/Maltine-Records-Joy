import p5 from 'p5';
import { Vec2 } from '../../util/Vec2';
import { isOutOfBounds } from '../../util/mathUtils';

/**
 * Car class representing the player's vehicle
 * Position is stored in normalized coordinates [0, 1]
 */
export class Car {
    private x: number = 0.5;
    private y: number = 0.5;
    private moveSpeed: number = 0.01;
    private viewDistance: number = 0.05;
    public angle: number = 0;

    constructor(private p: p5) { }

    /**
     * Update car state based on keyboard input
     */
    update(): void {
        const viewFrontX = this.x + Math.cos(this.angle) * this.viewDistance;
        const viewFrontY = this.y + Math.sin(this.angle) * this.viewDistance;

        const viewBackX = this.x + Math.cos(this.angle + Math.PI) * this.viewDistance;
        const viewBackY = this.y + Math.sin(this.angle + Math.PI) * this.viewDistance;

        if (this.p.keyIsPressed) {
            // Rotation controls
            if (this.p.key === 'ArrowLeft') {
                this.angle += 0.01;
            }
            if (this.p.key === 'ArrowRight') {
                this.angle -= 0.01;
            }

            // Movement controls with boundary checking
            if (this.p.key === 'ArrowUp' && !isOutOfBounds(viewFrontX, viewFrontY)) {
                this.x += Math.cos(this.angle) * this.moveSpeed;
                this.y += Math.sin(this.angle) * this.moveSpeed;
            }
            if (this.p.key === 'ArrowDown' && !isOutOfBounds(viewBackX, viewBackY)) {
                this.x += Math.cos(this.angle + Math.PI) * this.moveSpeed;
                this.y += Math.sin(this.angle + Math.PI) * this.moveSpeed;
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
}
