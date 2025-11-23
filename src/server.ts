import * as HID from "node-hid";
import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

// Joy-Con の定数
const VID = 0x057e; // Nintendo
const PID_R = 0x2007; // Joy-Con R
const PID_L = 0x2006; // Joy-Con L

// WebSocketサーバーのポート
const WS_PORT = 8080;
// HTTPサーバーのポート
const HTTP_PORT = 3000;

// 出力レポート 0x01（Sub-command）生成ユーティリティ
let pkt = 0;
const RUMBLE_OFF = Buffer.from([0, 1, 0x40, 0x40, 0, 1, 0x40, 0x40]); // 8 byte 固定

function makeSubCmd(id: number, data: Buffer = Buffer.alloc(0)): Buffer {
    const buf = Buffer.alloc(10 + data.length);
    buf[0] = 0x01; // Report ID
    buf[1] = pkt++ & 0x0f; // Packet counter (0-15)
    RUMBLE_OFF.copy(buf, 2);
    buf[10] = id; // Sub-command ID
    data.copy(buf, 11);
    return buf;
}

// Joy-Con接続（LとR両方）
const devices = HID.devices().filter(
    (d) => d.vendorId === VID && (d.productId === PID_R || d.productId === PID_L)
);

if (devices.length === 0) {
    console.error(
        "❌ Joy-Con が見つかりません。Bluetooth ペアリングを確認してください。"
    );
    process.exit(1);
}

console.log(`🎮 ${devices.length}個のJoy-Conを検出しました`);

// 各Joy-Conを初期化
const joycons: Array<{ device: HID.HID; type: string; isLeft: boolean; prevButtons: number[] }> = [];

for (const dev of devices) {
    try {
        const device = new HID.HID(dev.path!);
        const isLeft = dev.productId === PID_L;
        const type = isLeft ? "L" : "R";

        // 0x03: Set input-report mode → 0x30 (標準フルレポート 60 Hz)
        device.write([...makeSubCmd(0x03, Buffer.from([0x30]))]);

        joycons.push({
            device,
            type,
            isLeft,
            prevButtons: [0, 0, 0]
        });

        console.log(`✅ Joy-Con ${type} 接続完了`);
    } catch (err) {
        console.error("Joy-Con接続エラー:", err);
    }
}

if (joycons.length === 0) {
    console.error("❌ 使用可能なJoy-Conがありません");
    process.exit(1);
}

// WebSocketサーバーの起動
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
    console.log("✅ WebSocketクライアントが接続しました");
    clients.add(ws);

    ws.on("close", () => {
        console.log("❌ WebSocketクライアントが切断しました");
        clients.delete(ws);
    });

    ws.on("error", (err) => {
        console.error("WebSocketエラー:", err);
    });
});

console.log(`🌐 WebSocketサーバーが起動しました (ポート: ${WS_PORT})`);

// 各Joy-Conのボタン状態を監視
for (const joyconObj of joycons) {
    const { device, type, isLeft } = joyconObj;

    device.on("data", (buf: Buffer) => {
        // Joy-Conの標準入力レポート (0x3F または 0x30)
        if (buf[0] !== 0x3F && buf[0] !== 0x30) return;

        const button1 = buf[3];
        const button2 = buf[4];
        const button3 = buf[5];

        // ジョイスティックデータの解析
        const stickLX = buf[6] | ((buf[7] & 0x0F) << 8);
        const stickLY = (buf[7] >> 4) | (buf[8] << 4);
        const stickRX = buf[9] | ((buf[10] & 0x0F) << 8);
        const stickRY = (buf[10] >> 4) | (buf[11] << 4);

        // ジョイスティックの角度を計算
        const calcAngle = (x: number, y: number) => {
            const centerX = 2048;
            const centerY = 2048;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 300) {
                return null;
            }

            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            return Math.round(angle);
        };

        const leftStickAngle = isLeft ? calcAngle(stickLX, stickLY) : null;
        const rightStickAngle = !isLeft ? calcAngle(stickRX, stickRY) : null;

        // ボタン状態チェック
        const checkButton = (current: number, prev: number, bit: number, name: string) => {
            const nowPressed = !!(current & bit);
            const prevPressed = !!(prev & bit);

            if (nowPressed && !prevPressed) {
                broadcast({ type: "button", button: name, action: "press", joycon: type });
            } else if (!nowPressed && prevPressed) {
                broadcast({ type: "button", button: name, action: "release", joycon: type });
            }
        };

        if (isLeft) {
            // Joy-Con L
            checkButton(button3, joyconObj.prevButtons[2], 0x01, "Down");
            checkButton(button3, joyconObj.prevButtons[2], 0x02, "Up");
            checkButton(button3, joyconObj.prevButtons[2], 0x04, "Right");
            checkButton(button3, joyconObj.prevButtons[2], 0x08, "Left");
            checkButton(button3, joyconObj.prevButtons[2], 0x10, "SR");
            checkButton(button3, joyconObj.prevButtons[2], 0x20, "SL");
            checkButton(button3, joyconObj.prevButtons[2], 0x40, "L");
            checkButton(button3, joyconObj.prevButtons[2], 0x80, "ZL");

            checkButton(button2, joyconObj.prevButtons[1], 0x01, "Minus");
            checkButton(button2, joyconObj.prevButtons[1], 0x08, "LStick");
            checkButton(button2, joyconObj.prevButtons[1], 0x20, "Capture");
        } else {
            // Joy-Con R
            checkButton(button1, joyconObj.prevButtons[0], 0x01, "Y");
            checkButton(button1, joyconObj.prevButtons[0], 0x02, "X");
            checkButton(button1, joyconObj.prevButtons[0], 0x04, "B");
            checkButton(button1, joyconObj.prevButtons[0], 0x08, "A");
            checkButton(button1, joyconObj.prevButtons[0], 0x10, "SR");
            checkButton(button1, joyconObj.prevButtons[0], 0x20, "SL");
            checkButton(button1, joyconObj.prevButtons[0], 0x40, "R");
            checkButton(button1, joyconObj.prevButtons[0], 0x80, "ZR");

            checkButton(button2, joyconObj.prevButtons[1], 0x02, "Plus");
            checkButton(button2, joyconObj.prevButtons[1], 0x04, "RStick");
            checkButton(button2, joyconObj.prevButtons[1], 0x10, "Home");
        }

        // ジョイスティック角度送信
        if (leftStickAngle !== null) {
            broadcast({
                type: "joystick",
                stick: "left",
                angle: leftStickAngle,
                joycon: type
            });
        }
        if (rightStickAngle !== null) {
            broadcast({
                type: "joystick",
                stick: "right",
                angle: rightStickAngle,
                joycon: type
            });
        }

        joyconObj.prevButtons = [button1, button2, button3];
    });

    device.on("error", (err) => {
        console.error(`HID エラー [${type}]:`, err);
    });
}

// 全クライアントにメッセージをブロードキャスト
function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// HTTPサーバーで静的ファイルを配信
const server = http.createServer((req, res) => {
    // 開発時はViteが3000番ポートで動くため、このHTTPサーバーは不要
    // 本番時のみ使用
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("開発時はViteサーバー (http://localhost:3000) を使用してください");
        return;
    }

    let filePath = path.join(__dirname, "..", "dist", "client", req.url === "/" ? "index.html" : req.url!);

    const extname = path.extname(filePath);
    let contentType = "text/html";

    switch (extname) {
        case ".js":
            contentType = "text/javascript";
            break;
        case ".css":
            contentType = "text/css";
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404);
                res.end("404 Not Found");
            } else {
                res.writeHead(500);
                res.end("500 Internal Server Error");
            }
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
        }
    });
});

server.listen(HTTP_PORT, () => {
    console.log(`🌍 HTTPサーバーが起動しました: http://localhost:${HTTP_PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📱 開発時はViteサーバー http://localhost:3000 を使用してください`);
    }
});
