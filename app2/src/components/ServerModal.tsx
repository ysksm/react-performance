import React from 'react';
import type { Server, DataCenter, Rack, Container } from '../types/ServerData';

interface ServerModalProps {
  isOpen: boolean;
  server: Server | null;
  dataCenter?: DataCenter;
  rack?: Rack;
  onClose: () => void;
  onServerAction: (server: Server, action: 'start' | 'stop' | 'restart') => void;
  onContainerAction: (container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => void;
  onViewContainers: (server: Server) => void;
}

const ServerModal = React.memo<ServerModalProps>(({
  isOpen,
  server,
  dataCenter,
  rack,
  onClose,
  onServerAction,
  onContainerAction,
  onViewContainers
}) => {
  if (!isOpen || !server) return null;

  const getServerStatus = () => {
    if (server.status === 'error' || server.errors.length > 0) return 'error';
    if (server.status === 'warning' || server.cpu > 80 || server.memory > 80 || server.temperature > 75) return 'warning';
    if (server.status === 'maintenance') return 'maintenance';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'maintenance': return '#666666';
      default: return '#4caf50';
    }
  };

  const getContainerStatusSummary = () => {
    const total = server.containers.length;
    const running = server.containers.filter(c => c.status === 'running').length;
    const stopped = server.containers.filter(c => c.status === 'stopped').length;
    const paused = server.containers.filter(c => c.status === 'paused').length;
    const error = server.containers.filter(c => c.status === 'error').length;

    return { total, running, stopped, paused, error };
  };

  const formatUptime = () => {
    // Simulate uptime calculation
    const hours = Math.floor(Math.random() * 720) + 1; // 1-720 hours
    if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
  };

  const status = getServerStatus();
  const containerSummary = getContainerStatusSummary();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content server-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{server.name}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          {/* Hierarchy Path */}
          <div className="hierarchy-path">
            <span className="path-item">{dataCenter?.name || 'Unknown DC'}</span>
            <span className="path-separator">&gt;</span>
            <span className="path-item">{rack?.name || 'Unknown Rack'}</span>
            <span className="path-separator">&gt;</span>
            <span className="path-item current">{server.name}</span>
          </div>

          <div className="server-status-header">
            <div className="status-indicator" style={{ color: getStatusColor(status) }}>
              {status === 'error' && '🔴 Error'}
              {status === 'warning' && '🟡 Warning'}
              {status === 'maintenance' && '⚙️ Maintenance'}
              {status === 'healthy' && '🟢 Healthy'}
            </div>
            <div className="uptime">Uptime: {formatUptime()}</div>
          </div>
        </div>

        <div className="modal-body">
          {/* Server Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">CPU Usage</div>
              <div className={`metric-value ${server.cpu > 80 ? 'high' : server.cpu > 60 ? 'medium' : 'low'}`}>
                {Math.round(server.cpu * 10) / 10}%
              </div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${server.cpu}%`, backgroundColor: server.cpu > 80 ? '#f44336' : server.cpu > 60 ? '#ff9800' : '#4caf50' }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Memory Usage</div>
              <div className={`metric-value ${server.memory > 80 ? 'high' : server.memory > 60 ? 'medium' : 'low'}`}>
                {Math.round(server.memory * 10) / 10}%
              </div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${server.memory}%`, backgroundColor: server.memory > 80 ? '#f44336' : server.memory > 60 ? '#ff9800' : '#4caf50' }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Disk Usage</div>
              <div className={`metric-value ${server.disk > 80 ? 'high' : server.disk > 60 ? 'medium' : 'low'}`}>
                {Math.round(server.disk * 10) / 10}%
              </div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${server.disk}%`, backgroundColor: server.disk > 80 ? '#f44336' : server.disk > 60 ? '#ff9800' : '#4caf50' }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Temperature</div>
              <div className={`metric-value ${server.temperature > 75 ? 'high' : 'normal'}`}>
                {Math.round(server.temperature)}°C
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Network Usage</div>
              <div className="metric-value">
                {Math.round(server.network * 10) / 10}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Position</div>
              <div className="metric-value">
                Rack {rack?.position || '?'}, Slot {server.position}
              </div>
            </div>
          </div>

          {/* Container Summary */}
          <div className="container-summary-section">
            <h3>Container Overview</h3>
            <div className="container-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">{containerSummary.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Running</span>
                <span className="stat-value running">{containerSummary.running}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Stopped</span>
                <span className="stat-value stopped">{containerSummary.stopped}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Paused</span>
                <span className="stat-value paused">{containerSummary.paused}</span>
              </div>
              {containerSummary.error > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Errors</span>
                  <span className="stat-value error">{containerSummary.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Container Preview */}
          <div className="container-preview-section">
            <div className="section-header">
              <h3>Recent Containers</h3>
              <button
                className="view-all-btn"
                onClick={() => onViewContainers(server)}
              >
                View All Containers
              </button>
            </div>

            <div className="container-preview-list">
              {server.containers.slice(0, 3).map((container) => (
                <div key={container.id} className="container-preview-item">
                  <div className="container-info">
                    <span className="container-name">{container.name}</span>
                    <span className="container-image">{container.image}</span>
                  </div>
                  <div className="container-status">
                    <span className={`status-badge ${container.status}`}>
                      {container.status}
                    </span>
                  </div>
                  <div className="container-actions-mini">
                    <button
                      className="mini-action-btn"
                      onClick={() => onContainerAction(container, container.status === 'running' ? 'stop' : 'start')}
                      title={container.status === 'running' ? 'Stop' : 'Start'}
                    >
                      {container.status === 'running' ? '⏹️' : '▶️'}
                    </button>
                  </div>
                </div>
              ))}
              {server.containers.length === 0 && (
                <div className="no-containers">No containers on this server</div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {server.errors.length > 0 && (
            <div className="error-section">
              <h3>Active Errors</h3>
              <div className="error-list">
                {server.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-icon">⚠️</span>
                    <span className="error-message">{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="server-actions">
            <button
              className="action-btn start"
              onClick={() => onServerAction(server, 'start')}
              disabled={server.status === 'running'}
            >
              🚀 Start Server
            </button>
            <button
              className="action-btn stop"
              onClick={() => onServerAction(server, 'stop')}
              disabled={server.status !== 'running'}
            >
              ⏹️ Stop Server
            </button>
            <button
              className="action-btn restart"
              onClick={() => onServerAction(server, 'restart')}
              disabled={server.status !== 'running'}
            >
              🔄 Restart Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ServerModal.displayName = 'ServerModal';

export { ServerModal };