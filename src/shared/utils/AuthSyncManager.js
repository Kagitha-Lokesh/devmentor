class AuthSyncManager {
  constructor() {
    this.channelName = 'javamentor_auth_sync';
    this.channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(this.channelName)
      : null;
    this.initialized = false;
  }

  initialize() {
    if (typeof window === 'undefined' || this.initialized) return;
    this.initialized = true;

    // 1. Listen to BroadcastChannel events
    if (this.channel) {
      this.channel.onmessage = (event) => {
        this._handleSyncEvent(event.data);
      };
    }

    // 2. Fallback to LocalStorage 'storage' event for older browsers
    window.addEventListener('storage', (event) => {
      if (event.key === 'javamentor_auth_trigger' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this._handleSyncEvent(data);
        } catch {}
      }
    });
  }

  broadcast(type, payload = {}) {
    const eventData = { 
      type, 
      payload, 
      senderId: Math.random().toString(36).substr(2, 9), 
      timestamp: Date.now() 
    };
    
    // Broadcast via channel
    if (this.channel) {
      try {
        this.channel.postMessage(eventData);
      } catch {}
    }
    
    // Write to localStorage for cross-tab sync fallback
    try {
      localStorage.setItem('javamentor_auth_trigger', JSON.stringify(eventData));
    } catch {}
  }

  _handleSyncEvent(event) {
    if (!event || !event.type) return;

    // Avoid processing very old events or echoes
    if (Date.now() - event.timestamp > 3000) return;

    console.info(`[AuthSyncManager] Received cross-tab auth event: ${event.type}`);

    if (event.type === 'LOGOUT') {
      // Force reload to redirect to login and wipe all in-memory Zustand states
      window.location.reload();
    } else if (event.type === 'LOGIN') {
      // Force reload to sync new session profile
      window.location.reload();
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

export const authSyncManager = new AuthSyncManager();
export default authSyncManager;
