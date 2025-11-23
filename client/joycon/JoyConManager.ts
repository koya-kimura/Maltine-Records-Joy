import p5 from 'p5';

/**
 * Joy-Conのボタン状態を管理するクラス
 */
export class JoyConManager {
    private buttonStates: Map<string, boolean> = new Map();
    private prevButtonStates: Map<string, boolean> = new Map();
    private leftStickAngle: number | null = null;
    private rightStickAngle: number | null = null;
    private ws: WebSocket | null = null;
    private connectionStatus = '切断中';
    private isConnected = false;
    private onButtonPressCallbacks: Array<(button: string, joycon: string) => void> = [];
    private onButtonReleaseCallbacks: Array<(button: string, joycon: string) => void> = [];

    constructor() {
        this.connectWebSocket();
    }

    /**
     * WebSocket接続を確立
     */
    private connectWebSocket() {
        // 既存の接続があれば閉じる
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.onopen = () => {
            console.log('✅ WebSocket接続成功');
            this.connectionStatus = '接続中';
            this.isConnected = true;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'button') {
                const key = `${data.button}_${data.joycon}`;

                if (data.action === 'press') {
                    this.buttonStates.set(key, true);
                    this.onButtonPressCallbacks.forEach(cb => cb(data.button, data.joycon));
                } else if (data.action === 'release') {
                    this.buttonStates.set(key, false);
                    this.onButtonReleaseCallbacks.forEach(cb => cb(data.button, data.joycon));
                }
            } else if (data.type === 'joystick') {
                if (data.stick === 'left') {
                    this.leftStickAngle = data.angle;
                    setTimeout(() => {
                        this.leftStickAngle = null;
                    }, 100);
                } else if (data.stick === 'right') {
                    this.rightStickAngle = data.angle;
                    setTimeout(() => {
                        this.rightStickAngle = null;
                    }, 100);
                }
            }
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocketエラー:', error);
            this.connectionStatus = 'エラー';
            this.isConnected = false;
        };

        this.ws.onclose = () => {
            console.log('❌ WebSocket切断');
            this.connectionStatus = '切断中';
            this.isConnected = false;

            setTimeout(() => {
                console.log('🔄 再接続を試みます...');
                this.connectWebSocket();
            }, 5000);
        };
    }

    /**
     * WebSocket接続を手動で再接続
     */
    reconnect() {
        console.log('🔄 手動再接続を開始...');
        this.connectionStatus = '再接続中...';
        this.connectWebSocket();
    }

    /**
     * フレーム更新（毎フレーム呼び出す必要がある）
     * 前フレームのボタン状態を保存
     */
    update() {
        // 現在の状態を前フレームの状態として保存
        this.prevButtonStates.clear();
        this.buttonStates.forEach((value, key) => {
            this.prevButtonStates.set(key, value);
        });
    }

    /**
     * ボタンが押されているかチェック（押されている間ずっとtrue）
     * @param button ボタン名（例: "A", "B", "X", "Y", "Up", "Down"など）
     * @param joycon Joy-Conの種類（"L" または "R"）。省略時は両方をチェック
     */
    isPressed(button: string, joycon?: string): boolean {
        if (joycon) {
            return this.buttonStates.get(`${button}_${joycon}`) || false;
        }

        return this.buttonStates.get(`${button}_L`) ||
            this.buttonStates.get(`${button}_R`) ||
            false;
    }

    /**
     * ボタンが押された瞬間かチェック（押された最初のフレームのみtrue）
     * @param button ボタン名（例: "A", "B", "X", "Y", "Up", "Down"など）
     * @param joycon Joy-Conの種類（"L" または "R"）。省略時は両方をチェック
     */
    isJustPressed(button: string, joycon?: string): boolean {
        if (joycon) {
            const key = `${button}_${joycon}`;
            const current = this.buttonStates.get(key) || false;
            const prev = this.prevButtonStates.get(key) || false;
            const result = current == true && prev == false;

            return result;
        }

        // joycon指定なしの場合、LまたはRのどちらかが押された瞬間ならtrue
        const leftKey = `${button}_L`;
        const rightKey = `${button}_R`;

        const currentLeft = this.buttonStates.get(leftKey) || false;
        const prevLeft = this.prevButtonStates.get(leftKey) || false;
        const currentRight = this.buttonStates.get(rightKey) || false;
        const prevRight = this.prevButtonStates.get(rightKey) || false;

        const result = (currentLeft == true && prevLeft == false) || (currentRight == true && prevRight == false);

        return result;
    }

    /**
     * ボタン押下時のコールバックを登録
     */
    onButtonPress(callback: (button: string, joycon: string) => void) {
        this.onButtonPressCallbacks.push(callback);
    }

    /**
     * ボタン離した時のコールバックを登録
     */
    onButtonRelease(callback: (button: string, joycon: string) => void) {
        this.onButtonReleaseCallbacks.push(callback);
    }

    /**
     * 左スティックの角度を取得
     */
    getLeftStickAngle(): number | null {
        return this.leftStickAngle;
    }

    /**
     * 右スティックの角度を取得
     */
    getRightStickAngle(): number | null {
        return this.rightStickAngle;
    }

    /**
     * 接続状態を取得
     */
    getConnectionStatus(): string {
        return this.connectionStatus;
    }

    /**
     * 接続されているかチェック
     */
    isWebSocketConnected(): boolean {
        return this.isConnected;
    }

    /**
     * 現在押されているボタンの一覧を取得
     * @returns 押されているボタンのキーの配列（例: ["A_R", "Left_L"]）
     */
    getPressedButtons(): string[] {
        const pressed: string[] = [];
        this.buttonStates.forEach((value, key) => {
            if (value) {
                pressed.push(key);
            }
        });
        return pressed;
    }

    /**
     * 登録されている全てのボタンキーを取得（デバッグ用）
     * @returns 全てのボタンキーの配列
     */
    getAllButtonKeys(): string[] {
        return Array.from(this.buttonStates.keys());
    }
}
