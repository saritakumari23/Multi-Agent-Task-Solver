import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const ws = useRef(null);

  useEffect(() => {
    if (!url) return;

    // Create WebSocket connection
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.current.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      setConnectionStatus('Error');
      console.error('WebSocket error:', error);
      console.error('WebSocket URL:', url);
      console.error('WebSocket readyState:', ws.current?.readyState);
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.CLOSED) {
          console.log('Attempting to reconnect WebSocket...');
          ws.current = new WebSocket(url);
        }
      }, 3000);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    lastMessage,
    connectionStatus,
    sendMessage
  };
};
