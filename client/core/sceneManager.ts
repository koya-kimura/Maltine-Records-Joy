import p5 from "p5";

import { MainScene } from '../scene/MainScene';
import { RacingScene } from '../scene/racing/RacingScene';
import { BPMManager } from "../util/BPMManager";

// SceneManager は描画用の p5.Graphics とシーン、BPM管理のハブを担当する。
export class SceneManager {
    private renderTexture: p5.Graphics | null;
    private bpmManager: BPMManager;
    private racingScene: RacingScene | null;
    private p: p5 | null;

    // コンストラクタではシーン管理とBPMハンドラをセットアップする。
    constructor() {
        this.renderTexture = null;
        this.bpmManager = new BPMManager();
        this.racingScene = null;
        this.p = null;
    }

    // init はキャンバスサイズに合わせた描画用 Graphics を初期化する。
    init(p: p5): void {
        this.p = p;
        this.renderTexture = p.createGraphics(p.width, p.height);

        // RacingSceneを初期化
        this.racingScene = new RacingScene(p);
    }

    // getTexture は初期化済みの描画バッファを返し、未初期化時はエラーとする。
    getTexture(): p5.Graphics {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        return texture;
    }

    // resize は現在の Graphics を最新のウィンドウサイズに追従させる。
    resize(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        texture.resizeCanvas(p.width, p.height);

        // RacingSceneのリサイズ処理
        if (this.racingScene) {
            this.racingScene.resize(p);
        }
    }

    // update はシーンの更新前にBPM状態を反映させる。
    update(_p: p5): void {
        this.bpmManager.update();

        // RacingSceneの更新処理
        if (this.racingScene) {
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

        // RacingSceneを描画
        if (this.racingScene) {
            this.racingScene.drawToTexture(texture);
        }

        texture.pop();
    }

    keyPressed(keyCode: number): void {
        if (keyCode == 13) {
            this.bpmManager.tapTempo();
        }
    }

    getBPMManager(): BPMManager {
        return this.bpmManager;
    }
}