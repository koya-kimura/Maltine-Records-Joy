import p5 from 'p5';

/**
 * StartScene - スタート画面
 * タイトルと"Press ENTER to start"を表示
 */
export class StartScene {
    private onStart: () => void;
    private titleAlpha: number = 0;
    private fadeSpeed: number = 2;
    private font: p5.Font | null = null;

    constructor(private p: p5, onStart: () => void) {
        this.onStart = onStart;
    }

    /**
     * フォントを設定
     */
    setFont(font: p5.Font): void {
        this.font = font;
    }

    /**
     * スタート画面の更新処理
     */
    update(): void {
        // タイトルのフェードイン
        if (this.titleAlpha < 255) {
            this.titleAlpha = Math.min(255, this.titleAlpha + this.fadeSpeed);
        }
    }

    /**
     * スタート画面をテクスチャに描画
     */
    drawToTexture(texture: p5.Graphics): void {
        // フォントを適用
        if (this.font) {
            texture.textFont(this.font);
        }

        // 背景グラデーション
        for (let i = 0; i < texture.height; i++) {
            const inter = this.p.map(i, 0, texture.height, 0, 1);
            const c = this.p.lerpColor(
                this.p.color(20, 20, 60),
                this.p.color(60, 20, 80),
                inter
            );
            texture.stroke(c);
            texture.line(0, i, texture.width, i);
        }

        // タイトル
        texture.fill(255, 255, 255, this.titleAlpha);
        texture.noStroke();
        texture.textAlign(this.p.CENTER, this.p.CENTER);
        texture.textSize(72);
        texture.text('MALTINE RECORDS', texture.width / 2, texture.height / 2 - 80);

        texture.textSize(48);
        texture.text('JOY', texture.width / 2, texture.height / 2 - 10);

        // "Press ENTER to start" - 点滅
        const blinkAlpha = this.p.map(
            Math.sin(this.p.millis() / 500),
            -1,
            1,
            100,
            255
        );
        texture.fill(255, 255, 255, blinkAlpha);
        texture.textSize(24);
        texture.text('Press ENTER to start', texture.width / 2, texture.height / 2 + 100);

        // クレジット
        texture.fill(150, 150, 150, this.titleAlpha);
        texture.textSize(16);
        texture.text('© 2025 Maltine Records', texture.width / 2, texture.height - 50);
    }

    /**
     * キー入力処理
     */
    keyPressed(keyCode: number, key: string): void {
        // Enterキーでメニュー画面へ
        if (keyCode === 13 || key === 'Enter') {
            this.onStart();
        }
    }

    /**
     * リサイズ処理
     */
    resize(p: p5): void {
        // 必要に応じてレイアウトを調整
    }
}
