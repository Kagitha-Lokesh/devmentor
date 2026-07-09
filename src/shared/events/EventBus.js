class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to a domain event.
   * @param {string} event Event type name
   * @param {function} handler Callback when the event is published
   * @returns {function} Unsubscribe function
   */
  subscribe(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);

    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Publish a domain event.
   * @param {string} event Event type name
   * @param {any} payload Data payload sent to all subscribers
   */
  publish(event, payload) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      // Execute handlers safely in next tick to avoid blocking main threads
      handlers.forEach((handler) => {
        try {
          setTimeout(() => handler(payload), 0);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event "${event}":`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
export default eventBus;
