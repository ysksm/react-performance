import React from 'react';
import type { Rack, Server } from '../../types/ServerData';
import { rackEquals } from '../../utils/dataComparison';

interface ServerGridViewProps {
  rack: Rack;
  onServerSelect: (server: Server) => void;
  onServerAction: (server: Server, action: 'start' | 'stop' | 'restart') => void;
  onBack: () => void;
}

const ServerGridView = React.memo<ServerGridViewProps>(({ rack, onServerSelect, onServerAction, onBack }) => {
  const getServerStatus = (server: Server) => {
    if (server.status === 'error' || server.errors.length > 0) return 'error';
    if (server.status === 'warning' || server.cpu > 80 || server.memory > 80 || server.temperature > 75) return 'warning';
    if (server.status === 'maintenance') return 'maintenance';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'maintenance': return '#666666';
      default: return '#00cc44';
    }
  };

  const getContainerStatusSummary = (server: Server) => {
    const total = server.containers.length;
    const running = server.containers.filter(c => c.status === 'running').length;
    const stopped = server.containers.filter(c => c.status === 'stopped').length;
    const paused = server.containers.filter(c => c.status === 'paused').length;
    const error = server.containers.filter(c => c.status === 'error').length;

    return { total, running, stopped, paused, error };
  };

  return (
    <div className="server-grid-view">
      <div className="view-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Racks
          </button>
          <div className="header-info">
            <h1>{rack.name} - Servers</h1>
            <p className="rack-position">Position {rack.position}</p>
            <div className="summary-stats">
              <span>{rack.servers.length} Servers</span>
              <span>•</span>
              <span>
                {rack.servers.reduce((sum, server) => sum + server.containers.length, 0)} Total Containers
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="servers-grid">
        {rack.servers.map((server) => {
          const status = getServerStatus(server);
          const containerSummary = getContainerStatusSummary(server);

          return (
            <div
              key={server.id}
              className={`server-card ${status}`}
              style={{ borderColor: getStatusColor(status) }}
            >
              <div className="server-header">
                <div className="server-title">
                  <h3>{server.name}</h3>
                  <span className="server-position">Pos {server.position}</span>
                </div>
                <div className={`status-indicator ${status}`}>
                  {status === 'error' && '🔴'}
                  {status === 'warning' && '🟡'}
                  {status === 'maintenance' && '⚙️'}
                  {status === 'healthy' && '🟢'}
                </div>
              </div>

              <div className="server-metrics">
                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">CPU</span>
                    <span className={`metric-value ${server.cpu > 80 ? 'high' : server.cpu > 60 ? 'medium' : 'low'}`}>
                      {Math.round(server.cpu * 10) / 10}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Memory</span>
                    <span className={`metric-value ${server.memory > 80 ? 'high' : server.memory > 60 ? 'medium' : 'low'}`}>
                      {Math.round(server.memory * 10) / 10}%
                    </span>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">Disk</span>
                    <span className={`metric-value ${server.disk > 80 ? 'high' : server.disk > 60 ? 'medium' : 'low'}`}>
                      {Math.round(server.disk * 10) / 10}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Temp</span>
                    <span className={`metric-value ${server.temperature > 75 ? 'high' : 'normal'}`}>
                      {Math.round(server.temperature)}°C
                    </span>
                  </div>
                </div>

                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">Network</span>
                    <span className="metric-value">
                      {Math.round(server.network * 10) / 10}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Containers</span>
                    <span className="metric-value">
                      {containerSummary.running}/{containerSummary.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="container-status">
                <div className="container-indicators">
                  {containerSummary.running > 0 && (
                    <span className="container-badge running">
                      {containerSummary.running} Running
                    </span>
                  )}
                  {containerSummary.stopped > 0 && (
                    <span className="container-badge stopped">
                      {containerSummary.stopped} Stopped
                    </span>
                  )}
                  {containerSummary.paused > 0 && (
                    <span className="container-badge paused">
                      {containerSummary.paused} Paused
                    </span>
                  )}
                  {containerSummary.error > 0 && (
                    <span className="container-badge error">
                      {containerSummary.error} Error
                    </span>
                  )}
                </div>
              </div>

              {server.errors.length > 0 && (
                <div className="error-summary">
                  <span className="error-count">{server.errors.length} Error(s)</span>
                </div>
              )}

              <div className="server-actions">
                <button
                  className="action-btn primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onServerSelect(server);
                  }}
                >
                  View Containers
                </button>
                <div className="action-buttons">
                  <button
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServerAction(server, 'start');
                    }}
                    disabled={server.status === 'running'}
                  >
                    Start
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServerAction(server, 'stop');
                    }}
                    disabled={server.status !== 'running'}
                  >
                    Stop
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServerAction(server, 'restart');
                    }}
                    disabled={server.status !== 'running'}
                  >
                    Restart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ServerGridView.displayName = 'ServerGridView';

const areEqual = (prevProps: ServerGridViewProps, nextProps: ServerGridViewProps) => {
  return (
    rackEquals(prevProps.rack, nextProps.rack) &&
    prevProps.onServerSelect === nextProps.onServerSelect &&
    prevProps.onServerAction === nextProps.onServerAction &&
    prevProps.onBack === nextProps.onBack
  );
};

const OptimizedServerGridView = React.memo(ServerGridView, areEqual);

export { OptimizedServerGridView as ServerGridView };