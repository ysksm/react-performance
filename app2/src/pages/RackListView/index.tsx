import React from 'react';
import type { DataCenter, Rack } from '../../types/ServerData';
// import { dataCenterEquals } from '../../utils/dataComparison'; // 未使用

interface RackListViewProps {
  dataCenter: DataCenter;
  onRackSelect: (rack: Rack) => void;
  onBack: () => void;
}

const RackListView = React.memo<RackListViewProps>(({ dataCenter, onRackSelect, onBack }) => {
  const calculateRackStats = (rack: Rack) => {
    const totalServers = rack.servers.length;
    const runningServers = rack.servers.filter(server => server.status === 'running').length;
    const errorServers = rack.servers.filter(server => server.status === 'error' || server.errors.length > 0).length;
    const warningServers = rack.servers.filter(server => server.status === 'warning').length;

    const totalContainers = rack.servers.reduce((sum, server) => sum + server.containers.length, 0);
    const runningContainers = rack.servers.reduce(
      (sum, server) => sum + server.containers.filter(container => container.status === 'running').length,
      0
    );

    const avgCpu = rack.servers.reduce((sum, server) => sum + server.cpu, 0) / totalServers;
    const avgMemory = rack.servers.reduce((sum, server) => sum + server.memory, 0) / totalServers;
    const avgTemperature = rack.servers.reduce((sum, server) => sum + server.temperature, 0) / totalServers;

    const utilizationPercentage = (runningServers / totalServers) * 100;

    return {
      totalServers,
      runningServers,
      errorServers,
      warningServers,
      totalContainers,
      runningContainers,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      utilizationPercentage: Math.round(utilizationPercentage * 10) / 10
    };
  };

  const getHealthStatus = (stats: ReturnType<typeof calculateRackStats>) => {
    if (stats.errorServers > 0) return 'critical';
    if (stats.warningServers > 0) return 'warning';
    if (stats.avgCpu > 80 || stats.avgMemory > 80) return 'warning';
    return 'healthy';
  };

  return (
    <div className="rack-list-view">
      <div className="view-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Data Centers
          </button>
          <div className="header-info">
            <h1>{dataCenter.name} - Racks</h1>
            <p className="location">{dataCenter.location}</p>
            <div className="summary-stats">
              <span>{dataCenter.racks.length} Racks</span>
              <span>•</span>
              <span>{dataCenter.racks.reduce((sum, rack) => sum + rack.servers.length, 0)} Total Servers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rack-grid">
        {dataCenter.racks.map((rack) => {
          const stats = calculateRackStats(rack);
          const healthStatus = getHealthStatus(stats);

          return (
            <div
              key={rack.id}
              className={`rack-card ${healthStatus}`}
              onClick={() => onRackSelect(rack)}
            >
              <div className="rack-header">
                <h3>{rack.name}</h3>
                <span className="position">Position {rack.position}</span>
              </div>

              <div className="rack-status">
                <div className={`status-indicator ${healthStatus}`}>
                  {healthStatus === 'critical' && '🔴'}
                  {healthStatus === 'warning' && '🟡'}
                  {healthStatus === 'healthy' && '🟢'}
                </div>
                <span className="status-text">
                  {healthStatus === 'critical' && 'Critical Issues'}
                  {healthStatus === 'warning' && 'Needs Attention'}
                  {healthStatus === 'healthy' && 'All Systems OK'}
                </span>
              </div>

              <div className="rack-stats">
                <div className="stats-row">
                  <div className="stat-group">
                    <span className="stat-label">Servers</span>
                    <span className="stat-value">
                      {stats.runningServers}/{stats.totalServers}
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-label">Containers</span>
                    <span className="stat-value">
                      {stats.runningContainers}/{stats.totalContainers}
                    </span>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-group">
                    <span className="stat-label">Avg CPU</span>
                    <span className={`stat-value ${stats.avgCpu > 80 ? 'high' : stats.avgCpu > 60 ? 'medium' : 'low'}`}>
                      {stats.avgCpu}%
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-label">Avg Memory</span>
                    <span className={`stat-value ${stats.avgMemory > 80 ? 'high' : stats.avgMemory > 60 ? 'medium' : 'low'}`}>
                      {stats.avgMemory}%
                    </span>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-group">
                    <span className="stat-label">Temperature</span>
                    <span className={`stat-value ${stats.avgTemperature > 70 ? 'high' : 'normal'}`}>
                      {stats.avgTemperature}°C
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-label">Utilization</span>
                    <span className="stat-value">{stats.utilizationPercentage}%</span>
                  </div>
                </div>
              </div>

              {(stats.errorServers > 0 || stats.warningServers > 0) && (
                <div className="alerts-summary">
                  {stats.errorServers > 0 && (
                    <span className="alert error">{stats.errorServers} Errors</span>
                  )}
                  {stats.warningServers > 0 && (
                    <span className="alert warning">{stats.warningServers} Warnings</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

RackListView.displayName = 'RackListView';

/* const areEqual = (prevProps: RackListViewProps, nextProps: RackListViewProps) => {
  return (
    dataCenterEquals(prevProps.dataCenter, nextProps.dataCenter) &&
    prevProps.onRackSelect === nextProps.onRackSelect &&
    prevProps.onBack === nextProps.onBack
  );
}; */

// const OptimizedRackListView = React.memo(RackListView, areEqual);
// Optimized版は過度な最適化でリアルタイム更新を妨げているため、通常版を使用
export { RackListView };