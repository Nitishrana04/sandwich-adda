import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { sound } from '../utils/audio';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    // In dev, Vite proxies /socket.io to localhost:5000
    const s = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('⚡ Connected to Sandwich Adda WebSocket Server');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket Server');
      setIsConnected(false);
    });

    s.on('order:new', (order) => {
      console.log('🔔 [Socket] New Order:', order.orderNumber);
      sound.playNewOrderChime();
      setLatestEvent({ type: 'ORDER_NEW', data: order });
    });

    s.on('rider:order_assigned', (order) => {
      console.log('🛵 [Socket] Rider Assigned:', order.orderNumber);
      sound.playRiderBuzzer();
      setLatestEvent({ type: 'RIDER_ASSIGNED', data: order });
    });

    s.on('order:updated', (order) => {
      console.log('📦 [Socket] Order Updated:', order.orderNumber, order.status);
      if (order.status === 'DELIVERED') {
        sound.playSuccess();
      }
      setLatestEvent({ type: 'ORDER_UPDATED', data: order });
    });

    s.on('store:status_updated', (status) => {
      console.log('🏪 [Socket] Store Status Updated:', status.isOpen);
      setLatestEvent({ type: 'STORE_STATUS', data: status });
    });

    s.on('menu:updated', (menu) => {
      console.log('🥪 [Socket] Menu Updated');
      setLatestEvent({ type: 'MENU_UPDATED', data: menu });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, latestEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
