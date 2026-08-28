'use client';

type MessageHandler = (data: unknown) => void;

class GuardianWebSocket {
  private client: import('@stomp/stompjs').Client | null = null;
  private subscriptionHandlers: Map<string, MessageHandler[]> = new Map();
  private _connected = false;

  async connect(onConnect?: () => void, onError?: () => void) {
    if (typeof window === 'undefined') return;
    
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';
    
    const { Client } = await import('@stomp/stompjs');
    const SockJS = (await import('sockjs-client')).default;

    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        this._connected = true;
        this.resubscribeAll();
        onConnect?.();
      },
      onStompError: () => {
        this._connected = false;
        onError?.();
      },
      onDisconnect: () => {
        this._connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this._connected = false;
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.subscriptionHandlers.has(topic)) {
      this.subscriptionHandlers.set(topic, []);
    }
    this.subscriptionHandlers.get(topic)!.push(handler);

    if (this._connected && this.client) {
      this.client.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          handler(data);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      });
    }
  }

  private resubscribeAll() {
    if (!this.client) return;
    this.subscriptionHandlers.forEach((handlers, topic) => {
      this.client!.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          handlers.forEach((h) => h(data));
        } catch (e) {
          console.error('WS parse error:', e);
        }
      });
    });
  }

  get isConnected() { return this._connected; }
}

export const wsClient = new GuardianWebSocket();