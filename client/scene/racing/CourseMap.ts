import p5 from 'p5';
import { Vec2 } from '../../util/Vec2';
import { gcd, clampNorm, convertTo2DArray } from '../../util/mathUtils';
import { COURSE_DATA } from './courseData';

/**
 * CourseMap class for rendering the pseudo-3D racing view
 */
export class CourseMap {
    private course: number[][];
    private xn: number;
    private yn: number;
    private grid: number;

    constructor(private p: p5) {
        this.course = convertTo2DArray(COURSE_DATA);
        this.grid = 10;
        this.xn = Math.floor(p.width / this.grid);
        this.yn = Math.floor(p.height / this.grid);
    }

    /**
     * Draw the course map with pseudo-3D perspective
     * @param tex tex context to draw on
     * @param playerPosition Player's position as Vec2
     * @param playerAngle Player's viewing angle
     */
    draw(tex: p5.Graphics, playerPosition: Vec2, playerAngle: number): void {
        const viewAngle = Math.PI / 3;
        const viewLength = 0.35;

        for (let ix = 0; ix < this.xn; ix++) {
            for (let iy = 0; iy < this.yn; iy++) {
                const w = tex.width / this.xn;
                const h = tex.height / this.yn;
                const x = w * ix + w * 0.5;
                const y = h * iy + h * 0.5;

                // Map screen coordinates to normalized coordinates
                const sclx = this.p.map(x, 0, tex.width, 1, 0);
                const scly = this.p.map(y, 0, tex.height, 1, 0);

                // Calculate perspective projection
                const l = new Vec2(viewLength, 0.0)
                    .rot(playerAngle)
                    .rot(-viewAngle * 0.5);
                const r = new Vec2(viewLength, 0.0)
                    .rot(playerAngle)
                    .rot(viewAngle * 0.5);

                const v1 = l.mult((1 - sclx) * this.perspectiveFunc(scly));
                const v2 = r.mult(sclx * this.perspectiveFunc(scly));
                const v = v1.add(v2).add(playerPosition);

                // Map to course array indices
                const indexx = Math.floor(clampNorm(v.x) * this.course[0].length);
                const indexy = Math.floor(clampNorm(v.y) * this.course.length);

                const num = this.course[indexy][indexx];

                // Set color based on course tile type
                if (num === 0) {
                    tex.fill(255);
                } else if (num === 1) {
                    tex.fill(0, 200, 0);
                } else if (num === 2) {
                    tex.fill(0, 50, 0);
                }

                tex.rectMode(this.p.CENTER);
                tex.stroke(0, 50);
                tex.rect(x, y, w, h);
            }
        }
    }

    /**
     * Perspective projection function
     * Creates the depth effect
     * @param x Normalized depth value
     * @param n Perspective strength
     * @returns Projected value
     */
    private perspectiveFunc(x: number, n: number = 0.05): number {
        return n / (1 - x);
    }

    /**
     * Resize the map grid based on new dimensions
     */
    resize(p: p5): void {
        this.xn = Math.floor(p.width / this.grid);
        this.yn = Math.floor(p.height / this.grid);
    }
}
