import React from 'react';
import type { DataCenter, Rack, Server, ViewMode } from '../types/ServerData';

interface NavigationBreadcrumbProps {
  viewMode: ViewMode;
  dataCenter?: DataCenter;
  rack?: Rack;
  server?: Server;
  onNavigate: (mode: ViewMode, dataCenter?: DataCenter, rack?: Rack, server?: Server) => void;
}

const NavigationBreadcrumb = React.memo<NavigationBreadcrumbProps>(({
  viewMode,
  dataCenter,
  rack,
  server,
  onNavigate
}) => {
  const breadcrumbItems = [
    {
      label: 'Data Centers',
      mode: 'overview' as ViewMode,
      active: viewMode === 'overview',
      clickable: true
    }
  ];

  if (dataCenter) {
    breadcrumbItems.push({
      label: dataCenter.name,
      mode: 'racks' as ViewMode,
      active: viewMode === 'racks',
      clickable: viewMode !== 'overview'
    });
  }

  if (rack) {
    breadcrumbItems.push({
      label: rack.name,
      mode: 'servers' as ViewMode,
      active: viewMode === 'servers',
      clickable: viewMode === 'containers'
    });
  }

  if (server) {
    breadcrumbItems.push({
      label: server.name,
      mode: 'containers' as ViewMode,
      active: viewMode === 'containers',
      clickable: false
    });
  }

  const handleClick = (item: typeof breadcrumbItems[0]) => {
    if (!item.clickable) return;

    switch (item.mode) {
      case 'overview':
        onNavigate('overview');
        break;
      case 'racks':
        if (dataCenter) onNavigate('racks', dataCenter);
        break;
      case 'servers':
        if (dataCenter && rack) onNavigate('servers', dataCenter, rack);
        break;
      case 'containers':
        if (dataCenter && rack && server) onNavigate('containers', dataCenter, rack, server);
        break;
    }
  };

  return (
    <nav className="navigation-breadcrumb">
      <div className="breadcrumb-container">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.mode}>
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            <button
              className={`breadcrumb-item ${item.active ? 'active' : ''} ${item.clickable ? 'clickable' : ''}`}
              onClick={() => handleClick(item)}
              disabled={!item.clickable}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="view-mode-indicator">
        <span className="current-mode">
          {viewMode === 'overview' && 'Overview'}
          {viewMode === 'racks' && 'Racks View'}
          {viewMode === 'servers' && 'Servers View'}
          {viewMode === 'containers' && 'Containers View'}
        </span>
      </div>
    </nav>
  );
});

NavigationBreadcrumb.displayName = 'NavigationBreadcrumb';

export { NavigationBreadcrumb };