interface SkeletonLoaderProps {
  mode: 'overview' | 'racks' | 'servers' | 'containers';
}

export function SkeletonLoader({ mode }: SkeletonLoaderProps) {
  const renderOverviewSkeleton = () => (
    <div className="skeleton-container overview">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="datacenter-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="datacenter-card skeleton-card">
            <div className="skeleton skeleton-card-title"></div>
            <div className="skeleton skeleton-location"></div>
            <div className="datacenter-stats">
              {Array.from({ length: 4 }).map((_, statIndex) => (
                <div key={statIndex} className="stat">
                  <div className="skeleton skeleton-stat-label"></div>
                  <div className="skeleton skeleton-stat-value"></div>
                </div>
              ))}
            </div>
            <div className="skeleton skeleton-status-indicator"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRacksSkeleton = () => (
    <div className="skeleton-container racks">
      <div className="skeleton-header">
        <div className="skeleton skeleton-back-button"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="rack-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rack-card skeleton-card">
            <div className="rack-header">
              <div className="skeleton skeleton-rack-name"></div>
              <div className="skeleton skeleton-position"></div>
            </div>
            <div className="rack-status">
              <div className="skeleton skeleton-status-icon"></div>
              <div className="skeleton skeleton-status-text"></div>
            </div>
            <div className="rack-stats">
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div key={rowIndex} className="stats-row">
                  {Array.from({ length: 2 }).map((_, statIndex) => (
                    <div key={statIndex} className="stat-group">
                      <div className="skeleton skeleton-stat-label"></div>
                      <div className="skeleton skeleton-stat-value"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServersSkeleton = () => (
    <div className="skeleton-container servers">
      <div className="skeleton-header">
        <div className="skeleton skeleton-back-button"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="servers-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="server-card skeleton-card">
            <div className="server-header">
              <div className="server-title">
                <div className="skeleton skeleton-server-name"></div>
                <div className="skeleton skeleton-server-position"></div>
              </div>
              <div className="skeleton skeleton-status-indicator"></div>
            </div>
            <div className="server-metrics">
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div key={rowIndex} className="metric-row">
                  {Array.from({ length: 2 }).map((_, metricIndex) => (
                    <div key={metricIndex} className="metric">
                      <div className="skeleton skeleton-metric-label"></div>
                      <div className="skeleton skeleton-metric-value"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="container-status">
              <div className="container-indicators">
                {Array.from({ length: 3 }).map((_, badgeIndex) => (
                  <div key={badgeIndex} className="skeleton skeleton-container-badge"></div>
                ))}
              </div>
            </div>
            <div className="server-actions">
              <div className="skeleton skeleton-primary-button"></div>
              <div className="action-buttons">
                {Array.from({ length: 3 }).map((_, buttonIndex) => (
                  <div key={buttonIndex} className="skeleton skeleton-action-button"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContainersSkeleton = () => (
    <div className="skeleton-container containers">
      <div className="skeleton-header">
        <div className="skeleton skeleton-back-button"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="container-actions-panel">
        <div className="skeleton skeleton-add-button"></div>
        <div className="quick-stats">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-item">
              <div className="skeleton skeleton-stat-label"></div>
              <div className="skeleton skeleton-stat-value"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="containers-list">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="container-card skeleton-card">
            <div className="container-header">
              <div className="container-title">
                <div className="skeleton skeleton-container-icon"></div>
                <div className="title-info">
                  <div className="skeleton skeleton-container-name"></div>
                  <div className="skeleton skeleton-container-image"></div>
                </div>
              </div>
              <div className="container-status">
                <div className="skeleton skeleton-status-icon"></div>
                <div className="skeleton skeleton-status-text"></div>
              </div>
            </div>
            <div className="container-details">
              {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div key={rowIndex} className="details-row">
                  {Array.from({ length: 2 }).map((_, detailIndex) => (
                    <div key={detailIndex} className="detail-item">
                      <div className="skeleton skeleton-detail-label"></div>
                      <div className="skeleton skeleton-detail-value"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="container-actions">
              <div className="action-group">
                {Array.from({ length: 3 }).map((_, buttonIndex) => (
                  <div key={buttonIndex} className="skeleton skeleton-action-button"></div>
                ))}
              </div>
              <div className="skeleton skeleton-remove-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (mode) {
    case 'overview':
      return renderOverviewSkeleton();
    case 'racks':
      return renderRacksSkeleton();
    case 'servers':
      return renderServersSkeleton();
    case 'containers':
      return renderContainersSkeleton();
    default:
      return renderOverviewSkeleton();
  }
}