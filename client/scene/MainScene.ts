import p5 from 'p5';
import { JoyConManager } from '../joycon/JoyConManager';

/**
 * メインのスケッチシーン
 */
export class MainScene {
    private p: p5;
    private joycon: JoyConManager;

    constructor(p: p5, joycon: JoyConManager) {
        this.p = p;
        this.joycon = joycon;
    }

    /**
     * 描画処理
     */
    draw() {
        const p = this.p;

        p.background(255, 0, 0);

        // 中央に円を描画
        p.push();
        p.translate(p.width / 2, p.height / 2);
        if (this.joycon.isPressed("A")) {
            console.log("Aが押されてます");
            p.circle(-p.width / 4, 0, 200);
        }
        if (this.joycon.isJustPressed("A")) {
            console.log("Aが押されました");
            p.circle(p.width / 4, 0, 200);
        }
        p.pop();
    }
}
