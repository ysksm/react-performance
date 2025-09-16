import React from 'react';
import type { Container, Server, DataCenter, Rack } from '../types/ServerData';

interface ContainerModalProps {
  isOpen: boolean;
  container: Container | null;
  server?: Server;
  rack?: Rack;
  dataCenter?: DataCenter;
  onClose: () => void;
  onContainerAction: (container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => void;
}

const ContainerModal = React.memo<ContainerModalProps>(({
  isOpen,
  container,
  server,
  rack,
  dataCenter,
  onClose,
  onContainerAction
}) => {
  if (!isOpen || !container) return null;

  const getContainerIcon = (status: Container['status']) => {
    switch (status) {
      case 'running': return '▶️';
      case 'stopped': return '⏹️';
      case 'paused': return '⏸️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running': return '#4caf50';
      case 'stopped': return '#666666';
      case 'paused': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#666666';
    }
  };

  const getImageIcon = (image: string) => {
    if (image.includes('nginx')) return '🌐';
    if (image.includes('redis')) return '🔴';
    if (image.includes('postgres')) return '🐘';
    if (image.includes('mongodb')) return '🍃';
    if (image.includes('node')) return '🟢';
    if (image.includes('python')) return '🐍';
    return '📦';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const getContainerSize = () => {
    // Simulate container size calculation
    const sizeInMB = Math.floor(Math.random() * 2000) + 100; // 100MB - 2GB
    if (sizeInMB > 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const createdInfo = formatTimestamp(container.createdAt);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content container-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="container-title-with-icon">
              <span className="container-icon-large">{getImageIcon(container.image)}</span>
              <h2 className="modal-title">{container.name}</h2>
            </div>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          {/* Hierarchy Path */}
          <div className="hierarchy-path">
            <span className="path-item">{dataCenter?.name || 'Unknown DC'}</span>
            <span className="path-separator">></span>
            <span className="path-item">{rack?.name || 'Unknown Rack'}</span>
            <span className="path-separator">></span>
            <span className="path-item">{server?.name || 'Unknown Server'}</span>
            <span className="path-separator">></span>
            <span className="path-item current">{container.name}</span>
          </div>

          <div className="container-status-header">
            <div className="status-indicator" style={{ color: getStatusColor(container.status) }}>
              {getContainerIcon(container.status)} {container.status.toUpperCase()}
            </div>
            <div className="container-size">Size: {getContainerSize()}</div>
          </div>
        </div>

        <div className="modal-body">
          {/* Container Details */}
          <div className="detail-sections">
            <div className="detail-section">
              <h3>Container Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Image</span>
                  <span className="detail-value">
                    {getImageIcon(container.image)} {container.image}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Container ID</span>
                  <span className="detail-value mono">{container.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${container.status}`}>
                    {getContainerIcon(container.status)} {container.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <div className="detail-value">
                    <div>{createdInfo.relative}</div>
                    <div className="detail-sub">{createdInfo.date} at {createdInfo.time}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="detail-section">
              <h3>Resource Usage</h3>
              <div className="resource-metrics">
                <div className="resource-metric">
                  <div className="metric-header">
                    <span className="metric-label">CPU Usage</span>
                    <span className={`metric-value ${container.cpu > 40 ? 'high' : container.cpu > 20 ? 'medium' : 'low'}`}>
                      {Math.round(container.cpu * 10) / 10}%
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill"
                      style={{
                        width: `${container.cpu}%`,
                        backgroundColor: container.cpu > 40 ? '#f44336' : container.cpu > 20 ? '#ff9800' : '#4caf50'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="resource-metric">
                  <div className="metric-header">
                    <span className="metric-label">Memory Usage</span>
                    <span className={`metric-value ${container.memory > 80 ? 'high' : container.memory > 60 ? 'medium' : 'low'}`}>
                      {Math.round(container.memory * 10) / 10}%
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill"
                      style={{
                        width: `${container.memory}%`,
                        backgroundColor: container.memory > 80 ? '#f44336' : container.memory > 60 ? '#ff9800' : '#4caf50'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network & Ports */}
            <div className="detail-section">
              <h3>Network Configuration</h3>
              <div className="network-info">
                <div className="detail-item">
                  <span className="detail-label">Exposed Ports</span>
                  <div className="detail-value">
                    {container.ports.length > 0 ? (
                      <div className="ports-list">
                        {container.ports.map((port, index) => (
                          <span key={index} className="port-badge">
                            🔌 {port}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-ports">No exposed ports</span>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Network Mode</span>
                  <span className="detail-value">Bridge (default)</span>
                </div>
              </div>
            </div>

            {/* Parent Server Info */}
            {server && (
              <div className="detail-section">
                <h3>Host Server Information</h3>
                <div className="parent-server-info">
                  <div className="detail-item">
                    <span className="detail-label">Server Name</span>
                    <span className="detail-value">{server.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Server Status</span>
                    <span className={`detail-value status-${server.status}`}>
                      {server.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Server Location</span>
                    <span className="detail-value">
                      Rack {rack?.position || '?'}, Position {server.position}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Containers</span>
                    <span className="detail-value">{server.containers.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="container-actions">
            <button
              className="action-btn start"
              onClick={() => onContainerAction(container, 'start')}
              disabled={container.status === 'running'}
            >
              ▶️ Start
            </button>
            <button
              className="action-btn stop"
              onClick={() => onContainerAction(container, 'stop')}
              disabled={container.status === 'stopped'}
            >
              ⏹️ Stop
            </button>
            <button
              className="action-btn pause"
              onClick={() => onContainerAction(container, 'pause')}
              disabled={container.status !== 'running'}
            >
              ⏸️ Pause
            </button>
            <button
              className="action-btn remove danger"
              onClick={() => onContainerAction(container, 'remove')}
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ContainerModal.displayName = 'ContainerModal';

export { ContainerModal };