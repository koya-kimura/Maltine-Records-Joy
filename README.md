# Joy-Con + p5.js WebSocket プロジェクト

Nintendo Switch の Joy-Con R（右側）の入力を Node.js で読み取り、WebSocket を通じてブラウザに送信することで、p5.js の描画をリアルタイムで制御するプロジェクトです。

## 🎮 機能

- **Joy-Con LとR両方に対応**: 両方同時に接続可能
- **Aボタン**: 円の色をランダムに変更
  - Joy-Con R: Aボタン
  - Joy-Con L: 十字キー下
- **Bボタン**: 背景色をランダムに変更
  - Joy-Con R: Bボタン
  - Joy-Con L: 十字キー右
- **ボタンログ表示**: 画面左下にボタン押下履歴を表示（最大10件）
- **生データ表示**: A/B以外のボタンの生データを画面右下に表示
- リアルタイムでブラウザに反映

## 📋 必要な環境

- **Node.js**: v16 以上
- **Joy-Con R**: Bluetooth でペアリング済み
- **macOS**: このプロジェクトは macOS 向けに作成されています

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Joy-Con のペアリング確認

Joy-Con R を Mac に Bluetooth でペアリングしてください。

1. Joy-Con R の側面にあるシンクロボタンを長押し
2. Mac の「システム設定」→「Bluetooth」を開く
3. 「Joy-Con (R)」が表示されたら接続

### 3. サーバーの起動

```bash
npm run dev
```

以下のようなメッセージが表示されれば成功です：

```
🎮 Joy-Con R 接続完了
🌐 WebSocketサーバーが起動しました (ポート: 8080)
🌍 HTTPサーバーが起動しました: http://localhost:3000
📱 ブラウザで http://localhost:3000 を開いてください
```

### 4. ブラウザで開く

ブラウザで以下の URL を開いてください：

```
http://localhost:3000
```

### 5. Joy-Con で操作

- **Aボタン**を押すと、円の色が変わります
- **Bボタン**を押すと、背景色が変わります

## 📁 プロジェクト構造

```
joycon-test/
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript 設定（サーバー）
├── tsconfig.client.json  # TypeScript 設定（クライアント）
├── vite.config.ts        # Vite 設定
├── README.md             # このファイル
├── src/
│   └── server.ts         # WebSocket サーバー + Joy-Con 入力処理
└── client/
    ├── index.html        # HTMLページ
    ├── main.ts           # エントリーポイント
    └── sketch.ts         # p5.js スケッチ（TypeScript）
```

## 🛠️ トラブルシューティング

### Joy-Con が見つからない

```
❌ Joy-Con が見つかりません。Bluetooth ペアリングを確認してください。
```

このエラーが出た場合：

1. Joy-Con が Bluetooth でペアリングされているか確認
2. 他のデバイスに接続されていないか確認
3. Joy-Con を一度切断して再接続

### WebSocket に接続できない

ブラウザのコンソールに「WebSocket エラー」が表示される場合：

1. サーバーが起動しているか確認（`npm run dev`）
2. ポート 8080 が他のアプリケーションで使用されていないか確認

### ボタンを押しても反応しない

1. ブラウザのコンソールを開いて、メッセージが届いているか確認
2. サーバーのターミナルに「ボタン押下」などのメッセージが表示されるか確認
3. Joy-Con のバッテリーが十分か確認

## 🔧 開発コマンド

```bash
# 開発サーバーの起動（サーバー + Vite を同時起動）
npm run dev

# サーバーのみ起動
npm run dev:server

# クライアントのみ起動（Vite）
npm run dev:client

# ビルド（本番用）
npm run build

# ビルド済みファイルをプレビュー
npm run preview
```

## 📝 技術スタック

- **バックエンド**: Node.js + TypeScript
- **node-hid**: Joy-Con の HID デバイス入力を読み取り
- **ws**: WebSocket サーバー
- **フロントエンド**: TypeScript + Vite
- **p5.js**: ブラウザでの描画
- **WebSocket**: リアルタイム通信

## 📄 ライセンス

MIT
