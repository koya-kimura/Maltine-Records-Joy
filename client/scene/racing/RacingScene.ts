import p5 from 'p5';
import { Car } from './Car';
import { CourseMap } from './CourseMap';

/**
 * RacingScene - Main scene for the racing game
 * Renders to an external p5.Graphics texture provided by SceneManager
 */
export class RacingScene {
    private car: Car;
    private courseMap: CourseMap;

    constructor(private p: p5) {
        // Initialize game objects
        this.car = new Car(p);
        this.courseMap = new CourseMap(p, p.width, p.height);
    }

    /**
     * Update game state
     */
    update(): void {
        this.car.update();
    }

    /**
     * Draw the racing scene to the provided texture
     * @param texture The p5.Graphics texture to draw on
     */
    drawToTexture(texture: p5.Graphics): void {
        // Clear the texture with background color
        texture.background(100);

        // Draw the course map to the texture
        this.courseMap.draw(
            texture,
            this.car.getPosition(),
            this.car.getAngle()
        );

        // Optionally draw the car for debugging
        // this.car.draw(texture);
    }

    /**
     * Handle window resize
     */
    resize(p: p5): void {
        // Update course map dimensions
        this.courseMap.resize(p);
    }
}
