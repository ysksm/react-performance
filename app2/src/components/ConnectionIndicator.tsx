import { useState, useEffect } from 'react';

interface ConnectionIndicatorProps {
  status: 'online' | 'offline' | 'reconnecting';
  lastUpdate: Date | null;
}

function ConnectionIndicator({ status, lastUpdate }: ConnectionIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [connectionDuration, setConnectionDuration] = useState<string>('');
  const [connectTime, setConnectTime] = useState<Date | null>(null);

  // Track connection time
  useEffect(() => {
    if (status === 'online' && !connectTime) {
      setConnectTime(new Date());
    } else if (status !== 'online') {
      setConnectTime(null);
    }
  }, [status, connectTime]);

  // Update time displays
  useEffect(() => {
    const updateTimes = () => {
      if (lastUpdate) {
        const now = new Date();
        const diffMs = now.getTime() - lastUpdate.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);

        if (diffSeconds < 60) {
          setTimeAgo(`${diffSeconds}s ago`);
        } else if (diffSeconds < 3600) {
          setTimeAgo(`${Math.floor(diffSeconds / 60)}m ago`);
        } else {
          setTimeAgo(`${Math.floor(diffSeconds / 3600)}h ago`);
        }
      }

      if (connectTime && status === 'online') {
        const now = new Date();
        const diffMs = now.getTime() - connectTime.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);

        if (diffSeconds < 60) {
          setConnectionDuration(`${diffSeconds}s`);
        } else if (diffSeconds < 3600) {
          setConnectionDuration(`${Math.floor(diffSeconds / 60)}m`);
        } else {
          setConnectionDuration(`${Math.floor(diffSeconds / 3600)}h`);
        }
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate, connectTime, status]);

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return '🟢 Online';
      case 'offline':
        return '🔴 Offline';
      case 'reconnecting':
        return '🟡 Reconnecting...';
      default:
        return '⚪ Unknown';
    }
  };

  const getClassName = () => {
    return `connection-indicator connection-${status}`;
  };

  const getStatusDetails = () => {
    switch (status) {
      case 'online':
        return (
          <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: 1.2 }}>
            {connectionDuration && <div>Connected: {connectionDuration}</div>}
            {timeAgo && <div>Updated: {timeAgo}</div>}
          </div>
        );
      case 'offline':
        return (
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {lastUpdate && <div>Last seen: {timeAgo}</div>}
          </div>
        );
      case 'reconnecting':
        return (
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            Attempting to reconnect...
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getClassName()}>
      <div style={{ fontWeight: 'bold' }}>{getStatusText()}</div>
      {getStatusDetails()}
    </div>
  );
}

export default ConnectionIndicator;