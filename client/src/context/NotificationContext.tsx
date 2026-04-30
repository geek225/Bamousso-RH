import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.companyId) {
      // Écouter les nouvelles notifications pour cette entreprise
      const channel = supabase
        .channel(`notifications-${user.companyId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `companyId=eq.${user.companyId}`,
        }, (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          
          // Notification système (optionnel)
          if (Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.message });
          }
        })
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    }
  }, [user?.companyId]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
