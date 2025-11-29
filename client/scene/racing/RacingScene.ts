import p5 from 'p5';
import { Car } from './Car';
import { CourseMap } from './CourseMap';
import { JoyConManager } from '../../joycon/JoyConManager';

/**
 * RacingScene - Main scene for the racing game
 * Renders to an external p5.Graphics texture provided by SceneManager
 */
export class RacingScene {
    private car: Car;
    private courseMap: CourseMap;
    private onBackToMenu: (() => void) | null = null;
    private onBackToStart: (() => void) | null = null;

    constructor(private p: p5) {
        // Initialize game objects
        this.car = new Car(p);
        this.courseMap = new CourseMap(p);
    }

    /**
     * Set callback for returning to menu
     */
    setOnBackToMenu(callback: () => void): void {
        this.onBackToMenu = callback;
    }

    /**
     * Set callback for returning to start screen
     */
    setOnBackToStart(callback: () => void): void {
        this.onBackToStart = callback;
    }

    /**
     * Update game state
     */
    update(joycon: JoyConManager): void {
        this.car.update(joycon);
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
            this.car.getZ(),
            this.car.getAngle()
        );

        // Optionally draw the car for debugging
        // this.car.draw(texture);
    }

    /**
     * Handle key input
     */
    keyPressed(keyCode: number, key: string): void {
        // Hキーでメニューに戻る
        if (key === 'h' || key === 'H') {
            if (this.onBackToMenu) {
                this.onBackToMenu();
            }
        }
        // ESCキーでスタート画面に戻る
        else if (keyCode === 27) {
            if (this.onBackToStart) {
                this.onBackToStart();
            }
        }
    }

    /**
     * Handle window resize
     */
    resize(p: p5): void {
        // Update course map dimensions
        this.courseMap.resize(p);
    }
}
