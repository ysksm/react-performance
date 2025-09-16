import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { NavigationBreadcrumb } from './components/NavigationBreadcrumb'
import { DataCenterOverview } from './components/DataCenterOverview'
import { RackListView } from './components/RackListView'
import { ServerGridView } from './components/ServerGridView'
import { ContainerManageView } from './components/ContainerManageView'
import { SkeletonLoader } from './components/SkeletonLoader'
import ConnectionIndicator from './components/ConnectionIndicator'
import type { DataCenter, Rack, Server, Container, ViewMode } from './types/ServerData'

function App() {
  // Hierarchical data state
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null)
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)

  // Loading and error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('offline')

  const fetchDataCenters = async () => {
    try {
      setConnectionStatus('reconnecting')
      const response = await fetch('http://localhost:3001/api/datacenters')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setDataCenters(data)
      setLastUpdate(new Date())
      setLoading(false)
      setError(null)
      setConnectionStatus('online')
    } catch (err) {
      console.error('Failed to fetch data centers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data centers')
      setConnectionStatus('offline')
      if (dataCenters.length === 0) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchDataCenters()

    // Set up polling every 1 second
    const interval = setInterval(fetchDataCenters, 1000)

    // Cleanup function
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Update selected objects when data refreshes
  useEffect(() => {
    if (selectedDataCenter) {
      const updatedDC = dataCenters.find(dc => dc.id === selectedDataCenter.id);
      if (updatedDC) {
        setSelectedDataCenter(updatedDC);

        if (selectedRack) {
          const updatedRack = updatedDC.racks.find(r => r.id === selectedRack.id);
          if (updatedRack) {
            setSelectedRack(updatedRack);

            if (selectedServer) {
              const updatedServer = updatedRack.servers.find(s => s.id === selectedServer.id);
              if (updatedServer) {
                setSelectedServer(updatedServer);
              }
            }
          }
        }
      }
    }
  }, [dataCenters, selectedDataCenter?.id, selectedRack?.id, selectedServer?.id])

  // Navigation functions with useCallback for performance
  const handleNavigate = useCallback((mode: ViewMode, dataCenter?: DataCenter, rack?: Rack, server?: Server) => {
    setViewMode(mode);
    setSelectedDataCenter(dataCenter || null);
    setSelectedRack(rack || null);
    setSelectedServer(server || null);
  }, []);

  const handleDataCenterSelect = useCallback((dataCenter: DataCenter) => {
    setSelectedDataCenter(dataCenter);
    setSelectedRack(null);
    setSelectedServer(null);
    setViewMode('racks');
  }, []);

  const handleRackSelect = useCallback((rack: Rack) => {
    setSelectedRack(rack);
    setSelectedServer(null);
    setViewMode('servers');
  }, []);

  const handleServerSelect = useCallback((server: Server) => {
    setSelectedServer(server);
    setViewMode('containers');
  }, []);

  const handleServerAction = useCallback((server: Server, action: 'start' | 'stop' | 'restart') => {
    // TODO: Implement server action API calls
    console.log(`Server action: ${action} on ${server.name}`);
  }, []);

  const handleContainerAction = useCallback((container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => {
    // TODO: Implement container action API calls
    console.log(`Container action: ${action} on ${container.name}`);
  }, []);

  const handleAddContainer = useCallback((serverId: string) => {
    // TODO: Implement add container API call
    console.log(`Add container to server: ${serverId}`);
  }, []);

  const handleBack = useCallback(() => {
    switch (viewMode) {
      case 'racks':
        setViewMode('overview');
        setSelectedDataCenter(null);
        break;
      case 'servers':
        setViewMode('racks');
        setSelectedRack(null);
        break;
      case 'containers':
        setViewMode('servers');
        setSelectedServer(null);
        break;
    }
  }, [viewMode]);

  if (loading && dataCenters.length === 0) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Center Monitoring Dashboard</h1>
          <p className="app-subtitle">Loading hierarchical infrastructure data...</p>
        </header>

        <NavigationBreadcrumb
          viewMode="overview"
          onNavigate={() => {}}
        />

        <main className="app-main">
          <SkeletonLoader mode="overview" />
        </main>

        <ConnectionIndicator status={connectionStatus} lastUpdate={lastUpdate} />
      </div>
    )
  }

  if (error && dataCenters.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Data Center Monitoring Dashboard</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Make sure the API server is running on port 3001</p>
        <button className="retry-button" onClick={fetchDataCenters}>
          🔄 Retry Connection
        </button>
        <ConnectionIndicator status={connectionStatus} lastUpdate={lastUpdate} />
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'overview':
        return (
          <DataCenterOverview
            dataCenters={dataCenters}
            onDataCenterSelect={handleDataCenterSelect}
          />
        );

      case 'racks':
        if (!selectedDataCenter) return null;
        return (
          <RackListView
            dataCenter={selectedDataCenter}
            onRackSelect={handleRackSelect}
            onBack={handleBack}
          />
        );

      case 'servers':
        if (!selectedRack) return null;
        return (
          <ServerGridView
            rack={selectedRack}
            onServerSelect={handleServerSelect}
            onServerAction={handleServerAction}
            onBack={handleBack}
          />
        );

      case 'containers':
        if (!selectedServer) return null;
        return (
          <ContainerManageView
            server={selectedServer}
            onContainerAction={handleContainerAction}
            onAddContainer={handleAddContainer}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Center Monitoring Dashboard</h1>
        <p className="app-subtitle">
          Hierarchical infrastructure monitoring with real-time updates
        </p>
      </header>

      <NavigationBreadcrumb
        viewMode={viewMode}
        dataCenter={selectedDataCenter || undefined}
        rack={selectedRack || undefined}
        server={selectedServer || undefined}
        onNavigate={handleNavigate}
      />

      <main className="app-main">
        {renderCurrentView()}
      </main>

      <ConnectionIndicator status={connectionStatus} lastUpdate={lastUpdate} />
    </div>
  )
}

export default App
