const HAREM_WS_URL = 'wss://socketweb.haremaltin.com:443';

export const marketApi = {
  getRates: async () => {
    try {
      const response = await fetch('/market-api/today.json');
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn('Market API returned non-JSON response');
        return null;
      }
      if (!response.ok) throw new Error('Market data fetch failed');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  },

  connectHaremWebSocket: (onMessage, onError) => {
    let ws = null;
    let reconnectTimeout = null;

    const connect = () => {
      try {
        ws = new WebSocket(HAREM_WS_URL);

        ws.onopen = () => {
          console.log('Harem Altın WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
          } catch (e) {
            console.error('Error parsing Harem data:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('Harem WebSocket error:', error);
          if (onError) onError(error);
        };

        ws.onclose = () => {
          console.log('Harem WebSocket closed, reconnecting in 5s...');
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (e) {
        console.error('Error connecting to Harem WebSocket:', e);
        if (onError) onError(e);
      }
    };

    connect();

    return {
      close: () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (ws) ws.close();
      }
    };
  }
};
