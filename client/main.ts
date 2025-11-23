import p5 from 'p5';
import { JoyConManager } from './joycon/JoyConManager';
import { MainScene } from './scene/MainScene';

// JoyConManagerのインスタンスを作成
const joycon = new JoyConManager();
let mainScene: MainScene;

const sketch = (p: p5) => {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        // メインシーンを初期化
        mainScene = new MainScene(p, joycon);
    };

    p.draw = () => {
        // メインシーンの描画
        mainScene.draw();

        // JoyConManagerの状態を更新（draw末尾で実行) =============
        joycon.update();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.keyPressed = () => {
        // Rキーで再接続
        if (p.key === 'r' || p.key === 'R') {
            console.log('🔄 Rキーが押されました。再接続を試みます...');
            joycon.reconnect();
        }
    };
};

new p5(sketch);
