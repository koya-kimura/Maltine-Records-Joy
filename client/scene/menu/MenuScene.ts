import p5 from 'p5';

/**
 * ゲーム情報の型定義
 */
interface GameInfo {
    id: string;
    name: string;
    color: number[]; // [r, g, b]
}

/**
 * MenuScene - ゲーム選択メニュー
 * 横スクロール型のゲーム選択画面を提供
 */
export class MenuScene {
    private games: GameInfo[];
    private selectedIndex: number = 0;
    private tileWidth: number = 200;
    private tileHeight: number = 300;
    private spacing: number = 40;
    private onGameSelected: (gameId: string) => void;
    private onBackToStart: () => void;
    private font: p5.Font | null = null;

    constructor(
        private p: p5,
        onGameSelected: (gameId: string) => void,
        onBackToStart: () => void
    ) {
        this.onGameSelected = onGameSelected;
        this.onBackToStart = onBackToStart;

        // 利用可能なゲームのリスト
        this.games = [
            { id: 'racing', name: 'Racing Game', color: [0, 200, 0] },
            { id: 'game2', name: 'Coming Soon', color: [100, 100, 100] },
            { id: 'game3', name: 'Coming Soon', color: [100, 100, 100] },
        ];
    }

    /**
     * フォントを設定
     */
    setFont(font: p5.Font): void {
        this.font = font;
    }

    /**
     * メニューの更新処理
     */
    update(): void {
        // 現在は特に更新処理なし
    }

    /**
     * メニューをテクスチャに描画
     */
    drawToTexture(texture: p5.Graphics): void {
        // フォントを適用
        if (this.font) {
            texture.textFont(this.font);
        }

        texture.background(20, 20, 40);

        // タイトル
        texture.fill(255);
        texture.textAlign(this.p.CENTER, this.p.CENTER);
        texture.textSize(48);
        texture.text('SELECT GAME', texture.width / 2, 100);

        // ゲームタイルを描画
        const totalWidth = this.games.length * this.tileWidth + (this.games.length - 1) * this.spacing;
        const startX = (texture.width - totalWidth) / 2;
        const centerY = texture.height / 2;

        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];
            const x = startX + i * (this.tileWidth + this.spacing) + this.tileWidth / 2;
            const y = centerY;

            // 選択中のタイルは大きく表示
            const isSelected = i === this.selectedIndex;
            const scale = isSelected ? 1.1 : 1.0;
            const w = this.tileWidth * scale;
            const h = this.tileHeight * scale;

            // タイルの影
            if (isSelected) {
                texture.fill(0, 0, 0, 100);
                texture.noStroke();
                texture.rect(x + 5, y + 5, w, h);
            }

            // タイル本体
            texture.fill(game.color[0], game.color[1], game.color[2]);
            texture.stroke(255);
            texture.strokeWeight(isSelected ? 4 : 2);
            texture.rectMode(this.p.CENTER);
            texture.rect(x, y, w, h, 10);

            // ゲーム名
            texture.fill(255);
            texture.noStroke();
            texture.textSize(24);
            texture.text(game.name, x, y);

            // 選択中のインジケーター
            if (isSelected) {
                texture.fill(255, 200, 0);
                texture.textSize(16);
                texture.text('▼', x, y + h / 2 + 30);
            }
        }

        // 操作説明
        texture.fill(200);
        texture.textSize(18);
        texture.text('← → : Select   ENTER : Start   SHIFT : Back', texture.width / 2, texture.height - 50);
    }

    /**
     * キー入力処理
     */
    keyPressed(keyCode: number, key: string): void {
        // 左キー
        if (keyCode === 37 || key === 'ArrowLeft') {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        // 右キー
        else if (keyCode === 39 || key === 'ArrowRight') {
            this.selectedIndex = Math.min(this.games.length - 1, this.selectedIndex + 1);
        }
        // Enterキー
        else if (keyCode === 13 || key === 'Enter') {
            const selectedGame = this.games[this.selectedIndex];
            if (selectedGame.id !== 'game2' && selectedGame.id !== 'game3') {
                this.onGameSelected(selectedGame.id);
            }
        }
        // Shiftキー - スタート画面に戻る
        else if (keyCode === 16) {
            this.onBackToStart();
        }
    }

    /**
     * リサイズ処理
     */
    resize(p: p5): void {
        // 必要に応じてレイアウトを調整
    }
}
