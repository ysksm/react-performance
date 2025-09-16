import React, { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const NotificationToast = React.memo<NotificationToastProps>(({ messages, onRemove }) => {
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    messages.forEach(message => {
      if (message.duration !== 0) { // 0 means persistent
        const timer = setTimeout(() => {
          onRemove(message.id);
        }, message.duration || 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [messages, onRemove]);

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className="toast-container">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`toast toast-${message.type}`}
        >
          <div className="toast-content">
            <div className="toast-header">
              <span className="toast-icon">{getToastIcon(message.type)}</span>
              <span className="toast-title">{message.title}</span>
              <button
                className="toast-close"
                onClick={() => onRemove(message.id)}
              >
                ×
              </button>
            </div>
            <div className="toast-message">{message.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

NotificationToast.displayName = 'NotificationToast';

export { NotificationToast };