import { io } from 'socket.io-client';

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

  connectHaremSocket: (onMessage, onError) => {
    let socket = null;

    try {
      socket = io(HAREM_WS_URL, { 
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 5000,
      });

      socket.on('connect', () => {
        console.log('Harem Altın Socket.IO connected');
      });

      socket.on('price_changed', (payload) => {
        try {
          if (payload && payload.data) {
            if (onMessage) onMessage(payload.data);
          }
        } catch (e) {
          console.error('Error parsing Harem data:', e);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Harem Socket.IO error:', error);
        if (onError) onError(error);
      });

      socket.on('disconnect', () => {
        console.log('Harem Socket.IO disconnected');
      });
    } catch (e) {
      console.error('Error connecting to Harem Socket.IO:', e);
      if (onError) onError(e);
    }

    return {
      close: () => {
        if (socket) {
          socket.disconnect();
        }
      }
    };
  }
};
