import p5 from 'p5';
import { SceneManager } from './core/sceneManager';
import { EffectManager } from './core/effectManager';
import { JoyConManager } from './joycon/JoyConManager';

// JoyConManagerのインスタンスを作成
const sceneManager = new SceneManager();
const effectManager = new EffectManager();
const joycon = new JoyConManager();

const sketch = (p: p5) => {
    p.setup = async () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        sceneManager.init(p);

        await effectManager.load(
            p,
            "/shader/post.vert",
            "/shader/post.frag",
        );
    };

    p.draw = () => {
        sceneManager.update(p);
        sceneManager.draw(p);

        effectManager.apply(p, sceneManager.getTexture());

        // JoyConManagerの状態を更新（draw末尾で実行) =============
        joycon.update();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        sceneManager.resize(p);
    };

    p.keyPressed = () => {
        // フルスクリーン切り替え
        if (p.keyCode === 32) {
            p.fullscreen(true);
        }

        // SceneManagerにキー入力を転送
        sceneManager.keyPressed(p.keyCode, p.key);

        // Rキーで再接続
        if (p.key === 'r' || p.key === 'R') {
            console.log('🔄 Rキーが押されました。再接続を試みます...');
            joycon.reconnect();
        }
    };
};

new p5(sketch);

