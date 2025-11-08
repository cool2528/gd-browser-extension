import type { Aria2Config, Aria2RpcRequest, Aria2RpcResponse } from '@/shared/types';

/**
 * aria2 JSON-RPC WebSocket 客户端
 * 负责与 aria2c 建立 WebSocket 连接并进行 RPC 通信
 */
export class Aria2RpcClient {
  private ws: WebSocket | null = null;
  private rpcUrl: string;
  private secret: string;
  private messageId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private connectPromise: Promise<void> | null = null;

  constructor(config: Aria2Config) {
    this.rpcUrl = config.url;
    this.secret = config.secret;
  }

  /**
   * 建立 WebSocket 连接
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.rpcUrl);

      this.ws.onopen = () => {
        console.log('Connected to aria2c');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from aria2c');
        this.handleDisconnect();
      };
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string) {
    try {
      const response: Aria2RpcResponse = JSON.parse(data);

      if (response.id) {
        const pending = this.pendingRequests.get(String(response.id));
        if (pending) {
          this.pendingRequests.delete(String(response.id));

          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
    }
  }

  /**
   * 确保已连接
   */
  async ensureConnected(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.connect();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  /**
   * 调用 aria2 RPC 方法
   */
  async call(method: string, ...params: any[]): Promise<any> {
    await this.ensureConnected();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const id = (++this.messageId).toString();

    const request: Aria2RpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params: [`token:${this.secret}`, ...params]
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      this.ws!.send(JSON.stringify(request));

      // 30 秒超时
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect() {
    // 拒绝所有待处理的请求
    for (const [_id, { reject }] of this.pendingRequests) {
      reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();

    // 可选：自动重连
    // setTimeout(() => this.reconnect(), 5000);
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      throw new Error('Max reconnection attempts reached');
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await this.connect();
      this.reconnectAttempts = 0;
      console.log('Reconnected successfully');
    } catch (error) {
      this.reconnectAttempts++;
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 获取 WebSocket 状态
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}
