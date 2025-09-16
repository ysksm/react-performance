import React from 'react';
import type { DataCenter } from '../../types/ServerData';

interface DataCenterOverviewProps {
  dataCenters: DataCenter[];
  onDataCenterSelect: (dataCenter: DataCenter) => void;
}

const DataCenterOverview = React.memo<DataCenterOverviewProps>(({ dataCenters, onDataCenterSelect }) => {
  const calculateStats = (dataCenter: DataCenter) => {
    const totalRacks = dataCenter.racks.length;
    const totalServers = dataCenter.racks.reduce((sum, rack) => sum + rack.servers.length, 0);
    const totalContainers = dataCenter.racks.reduce(
      (sum, rack) => sum + rack.servers.reduce((serverSum, server) => serverSum + server.containers.length, 0),
      0
    );

    const errorCount = dataCenter.racks.reduce(
      (sum, rack) => sum + rack.servers.filter(server => server.status === 'error' || server.errors.length > 0).length,
      0
    );

    const warningCount = dataCenter.racks.reduce(
      (sum, rack) => sum + rack.servers.filter(server => server.status === 'warning').length,
      0
    );

    const avgCpu = dataCenter.racks.reduce(
      (sum, rack) => sum + rack.servers.reduce((serverSum, server) => serverSum + server.cpu, 0),
      0
    ) / totalServers;

    return {
      totalRacks,
      totalServers,
      totalContainers,
      errorCount,
      warningCount,
      avgCpu: Math.round(avgCpu * 10) / 10
    };
  };

  return (
    <div className="data-center-overview">
      <div className="overview-header">
        <h1>Data Center Overview</h1>
        <p>Select a data center to view racks and servers</p>
      </div>

      <div className="data-center-grid">
        {dataCenters.map((dataCenter) => {
          const stats = calculateStats(dataCenter);
          return (
            <div
              key={dataCenter.id}
              className="data-center-card"
              onClick={() => onDataCenterSelect(dataCenter)}
            >
              <div className="card-header">
                <h2>{dataCenter.name}</h2>
                <span className="location">{dataCenter.location}</span>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Racks</span>
                  <span className="stat-value">{stats.totalRacks}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Servers</span>
                  <span className="stat-value">{stats.totalServers}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Containers</span>
                  <span className="stat-value">{stats.totalContainers}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg CPU</span>
                  <span className="stat-value">{stats.avgCpu}%</span>
                </div>
              </div>

              <div className="status-indicators">
                {stats.errorCount > 0 && (
                  <div className="status-badge error">
                    {stats.errorCount} Errors
                  </div>
                )}
                {stats.warningCount > 0 && (
                  <div className="status-badge warning">
                    {stats.warningCount} Warnings
                  </div>
                )}
                {stats.errorCount === 0 && stats.warningCount === 0 && (
                  <div className="status-badge success">
                    All Systems OK
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DataCenterOverview.displayName = 'DataCenterOverview';

const areEqual = (prevProps: DataCenterOverviewProps, nextProps: DataCenterOverviewProps) => {
  if (prevProps.onDataCenterSelect !== nextProps.onDataCenterSelect) {
    return false;
  }

  if (prevProps.dataCenters.length !== nextProps.dataCenters.length) {
    return false;
  }

  // Only compare structural properties (id, name, location) and array lengths
  // Skip the dynamic numerical values that should trigger updates
  for (let i = 0; i < prevProps.dataCenters.length; i++) {
    const prevDC = prevProps.dataCenters[i];
    const nextDC = nextProps.dataCenters[i];

    if (prevDC.id !== nextDC.id || prevDC.name !== nextDC.name || prevDC.location !== nextDC.location) {
      return false;
    }

    if (prevDC.racks.length !== nextDC.racks.length) {
      return false;
    }

    // For racks, only check structural properties
    for (let j = 0; j < prevDC.racks.length; j++) {
      const prevRack = prevDC.racks[j];
      const nextRack = nextDC.racks[j];

      if (prevRack.id !== nextRack.id || prevRack.servers.length !== nextRack.servers.length) {
        return false;
      }
    }
  }

  return true;
};

const OptimizedDataCenterOverview = React.memo(DataCenterOverview, areEqual);

export { OptimizedDataCenterOverview as DataCenterOverview };