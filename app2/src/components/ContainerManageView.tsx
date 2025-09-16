import type { Server, Container } from '../types/ServerData';

interface ContainerManageViewProps {
  server: Server;
  onContainerAction: (container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => void;
  onAddContainer: (serverID: string) => void;
  onBack: () => void;
}

export function ContainerManageView({ server, onContainerAction, onAddContainer, onBack }: ContainerManageViewProps) {
  const getContainerStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running': return '#00cc44';
      case 'stopped': return '#666666';
      case 'paused': return '#ffaa00';
      case 'error': return '#ff4444';
      default: return '#666666';
    }
  };

  const getContainerIcon = (status: Container['status']) => {
    switch (status) {
      case 'running': return '▶️';
      case 'stopped': return '⏹️';
      case 'paused': return '⏸️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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

  const containerStats = {
    total: server.containers.length,
    running: server.containers.filter(c => c.status === 'running').length,
    stopped: server.containers.filter(c => c.status === 'stopped').length,
    paused: server.containers.filter(c => c.status === 'paused').length,
    error: server.containers.filter(c => c.status === 'error').length,
    totalCpu: server.containers.reduce((sum, c) => sum + c.cpu, 0),
    totalMemory: server.containers.reduce((sum, c) => sum + c.memory, 0)
  };

  return (
    <div className="container-manage-view">
      <div className="view-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Servers
          </button>
          <div className="header-info">
            <h1>{server.name} - Container Management</h1>
            <p className="server-status">
              Status: <span className={`status ${server.status}`}>{server.status}</span>
            </p>
            <div className="summary-stats">
              <span>{containerStats.total} Containers</span>
              <span>•</span>
              <span>{containerStats.running} Running</span>
              <span>•</span>
              <span>CPU: {Math.round(containerStats.totalCpu * 10) / 10}%</span>
              <span>•</span>
              <span>Memory: {Math.round(containerStats.totalMemory * 10) / 10}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-actions-panel">
        <button
          className="add-container-btn"
          onClick={() => onAddContainer(server.id)}
        >
          + Add New Container
        </button>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Running</span>
            <span className="stat-value running">{containerStats.running}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Stopped</span>
            <span className="stat-value stopped">{containerStats.stopped}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Paused</span>
            <span className="stat-value paused">{containerStats.paused}</span>
          </div>
          {containerStats.error > 0 && (
            <div className="stat-item">
              <span className="stat-label">Errors</span>
              <span className="stat-value error">{containerStats.error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="containers-list">
        {server.containers.length === 0 ? (
          <div className="empty-state">
            <p>No containers running on this server</p>
            <button
              className="add-container-btn secondary"
              onClick={() => onAddContainer(server.id)}
            >
              Add Your First Container
            </button>
          </div>
        ) : (
          server.containers.map((container) => (
            <div
              key={container.id}
              className={`container-card ${container.status}`}
              style={{ borderLeftColor: getContainerStatusColor(container.status) }}
            >
              <div className="container-header">
                <div className="container-title">
                  <span className="container-icon">{getImageIcon(container.image)}</span>
                  <div className="title-info">
                    <h3>{container.name}</h3>
                    <span className="container-image">{container.image}</span>
                  </div>
                </div>
                <div className="container-status">
                  <span className="status-icon">{getContainerIcon(container.status)}</span>
                  <span className={`status-text ${container.status}`}>{container.status}</span>
                </div>
              </div>

              <div className="container-details">
                <div className="details-row">
                  <div className="detail-item">
                    <span className="detail-label">CPU Usage</span>
                    <span className={`detail-value ${container.cpu > 40 ? 'high' : container.cpu > 20 ? 'medium' : 'low'}`}>
                      {Math.round(container.cpu * 10) / 10}%
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Memory Usage</span>
                    <span className={`detail-value ${container.memory > 80 ? 'high' : container.memory > 60 ? 'medium' : 'low'}`}>
                      {Math.round(container.memory * 10) / 10}%
                    </span>
                  </div>
                </div>

                <div className="details-row">
                  <div className="detail-item">
                    <span className="detail-label">Ports</span>
                    <span className="detail-value ports">
                      {container.ports.length > 0 ? container.ports.join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created</span>
                    <span className="detail-value timestamp">
                      {formatTimestamp(container.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="container-actions">
                <div className="action-group">
                  <button
                    className="action-btn start"
                    onClick={() => onContainerAction(container, 'start')}
                    disabled={container.status === 'running'}
                  >
                    Start
                  </button>
                  <button
                    className="action-btn stop"
                    onClick={() => onContainerAction(container, 'stop')}
                    disabled={container.status === 'stopped'}
                  >
                    Stop
                  </button>
                  <button
                    className="action-btn pause"
                    onClick={() => onContainerAction(container, 'pause')}
                    disabled={container.status !== 'running'}
                  >
                    Pause
                  </button>
                </div>
                <button
                  className="action-btn remove"
                  onClick={() => onContainerAction(container, 'remove')}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}