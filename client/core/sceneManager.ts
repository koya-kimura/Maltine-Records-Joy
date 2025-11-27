import p5 from "p5";

import { MainScene } from '../scene/MainScene';
import { StartScene } from '../scene/menu/StartScene';
import { MenuScene } from '../scene/menu/MenuScene';
import { RacingScene } from '../scene/racing/RacingScene';
import { BPMManager } from "../util/BPMManager";

type SceneType = 'start' | 'menu' | 'racing';

// SceneManager は描画用の p5.Graphics とシーン、BPM管理のハブを担当する。
export class SceneManager {
    private renderTexture: p5.Graphics | null;
    private bpmManager: BPMManager;
    private startScene: StartScene | null;
    private menuScene: MenuScene | null;
    private racingScene: RacingScene | null;
    private currentScene: SceneType;
    private p: p5 | null;

    // コンストラクタではシーン管理とBPMハンドラをセットアップする。
    constructor() {
        this.renderTexture = null;
        this.bpmManager = new BPMManager();
        this.startScene = null;
        this.menuScene = null;
        this.racingScene = null;
        this.currentScene = 'start'; // デフォルトはスタート画面
        this.p = null;
    }

    // init はキャンバスサイズに合わせた描画用 Graphics を初期化する。
    init(p: p5): void {
        this.p = p;
        this.renderTexture = p.createGraphics(p.width, p.height);

        // StartSceneを初期化
        this.startScene = new StartScene(p, () => {
            this.switchScene('menu');
        });

        // MenuSceneを初期化
        this.menuScene = new MenuScene(
            p,
            (gameId: string) => {
                this.switchScene(gameId as SceneType);
            },
            () => {
                this.switchScene('start');
            }
        );

        // RacingSceneを初期化
        this.racingScene = new RacingScene(p);
        this.racingScene.setOnBackToMenu(() => {
            this.switchScene('menu');
        });
        this.racingScene.setOnBackToStart(() => {
            this.switchScene('start');
        });
    }

    // getTexture は初期化済みの描画バッファを返し、未初期化時はエラーとする。
    getTexture(): p5.Graphics {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        return texture;
    }

    // switchScene はシーンを切り替える
    switchScene(sceneName: SceneType): void {
        this.currentScene = sceneName;
        console.log(`🎬 Switched to ${sceneName} scene`);
    }

    // resize は現在の Graphics を最新のウィンドウサイズに追従させる。
    resize(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        texture.resizeCanvas(p.width, p.height);

        // 各シーンのリサイズ処理
        if (this.startScene) {
            this.startScene.resize(p);
        }
        if (this.menuScene) {
            this.menuScene.resize(p);
        }
        if (this.racingScene) {
            this.racingScene.resize(p);
        }
    }

    // update はシーンの更新前にBPM状態を反映させる。
    update(_p: p5): void {
        this.bpmManager.update();

        // 現在のシーンの更新処理
        if (this.currentScene === 'start' && this.startScene) {
            this.startScene.update();
        } else if (this.currentScene === 'menu' && this.menuScene) {
            this.menuScene.update();
        } else if (this.currentScene === 'racing' && this.racingScene) {
            this.racingScene.update();
        }
    }

    // draw はシーン描画をGraphics上にまとめて描画する。
    draw(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }

        texture.push();
        texture.clear();

        // 現在のシーンを描画
        if (this.currentScene === 'start' && this.startScene) {
            this.startScene.drawToTexture(texture);
        } else if (this.currentScene === 'menu' && this.menuScene) {
            this.menuScene.drawToTexture(texture);
        } else if (this.currentScene === 'racing' && this.racingScene) {
            this.racingScene.drawToTexture(texture);
        }

        texture.pop();
    }

    keyPressed(keyCode: number, key: string): void {
        // BPMタップテンポ
        if (keyCode === 13) {
            this.bpmManager.tapTempo();
        }

        // 現在のシーンにキー入力を委譲
        if (this.currentScene === 'start' && this.startScene) {
            this.startScene.keyPressed(keyCode, key);
        } else if (this.currentScene === 'menu' && this.menuScene) {
            this.menuScene.keyPressed(keyCode, key);
        } else if (this.currentScene === 'racing' && this.racingScene) {
            this.racingScene.keyPressed(keyCode, key);
        }
    }

    getBPMManager(): BPMManager {
        return this.bpmManager;
    }
}