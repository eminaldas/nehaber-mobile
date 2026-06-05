import { WS_URL } from '../constants/config';

class WsService {
  constructor() {
    this._ws         = null;
    this._token      = null;
    this._listeners  = {}; // { eventType: Set<handler> }
    this._retryDelay = 1000;
    this._retryTimer = null;
    this._destroyed  = false;
  }

  connect(token) {
    if (this._ws) this.disconnect();
    this._token    = token;
    this._destroyed = false;
    this._open();
  }

  _open() {
    if (this._destroyed || !this._token) return;
    this._ws = new WebSocket(`${WS_URL}?token=${this._token}`);

    this._ws.onopen = () => {
      this._retryDelay = 1000;
      this._emit('connected', null);
    };

    this._ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.type) this._emit(msg.type, msg);
      } catch (_) {}
    };

    this._ws.onerror = () => {};

    this._ws.onclose = () => {
      this._emit('disconnected', null);
      if (!this._destroyed) {
        this._retryTimer = setTimeout(() => {
          this._retryDelay = Math.min(this._retryDelay * 2, 30000);
          this._open();
        }, this._retryDelay);
      }
    };
  }

  disconnect() {
    this._destroyed = true;
    clearTimeout(this._retryTimer);
    if (this._ws) {
      this._ws.onclose = null;
      this._ws.close();
      this._ws = null;
    }
  }

  subscribe(eventType, handler) {
    if (!this._listeners[eventType]) this._listeners[eventType] = new Set();
    this._listeners[eventType].add(handler);
    return () => this._listeners[eventType]?.delete(handler);
  }

  _emit(eventType, payload) {
    this._listeners[eventType]?.forEach(h => h(payload));
  }

  get connected() {
    return this._ws?.readyState === WebSocket.OPEN;
  }
}

export default new WsService();
