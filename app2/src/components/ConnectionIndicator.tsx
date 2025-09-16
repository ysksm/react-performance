interface ConnectionIndicatorProps {
  status: 'online' | 'offline' | 'reconnecting';
  lastUpdate: Date | null;
}

function ConnectionIndicator({ status, lastUpdate }: ConnectionIndicatorProps) {
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

  return (
    <div className={getClassName()}>
      <div>{getStatusText()}</div>
      {lastUpdate && status === 'online' && (
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Last: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default ConnectionIndicator;