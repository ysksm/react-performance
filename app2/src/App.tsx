import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { NavigationBreadcrumb } from './components/NavigationBreadcrumb'
import { DataCenterOverview } from './components/DataCenterOverview'
import { RackListView } from './components/RackListView'
import { ServerGridView } from './components/ServerGridView'
import { ContainerManageView } from './components/ContainerManageView'
import { SkeletonLoader } from './components/SkeletonLoader'
import { ConfirmationDialog } from './components/ConfirmationDialog'
import { NotificationToast, type ToastMessage } from './components/NotificationToast'
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

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Toast notification state
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    setToastMessages(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToastMessages(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const fetchDataCenters = async () => {
    try {
      setConnectionStatus('reconnecting')
      const startTime = Date.now()
      const response = await fetch('http://localhost:3001/api/datacenters')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const fetchTime = Date.now() - startTime

      // Log performance metrics
      const serverProcessingTime = response.headers.get('X-Data-Generation-Time')
      const totalEntities = response.headers.get('X-Total-Entities')

      console.log(`Data fetch completed:`, {
        totalFetchTime: fetchTime,
        serverProcessingTime: serverProcessingTime ? parseInt(serverProcessingTime) : 'N/A',
        totalEntities: totalEntities ? parseInt(totalEntities) : 'N/A',
        dataSize: JSON.stringify(data).length
      })

      // Validate hierarchical data structure
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data structure received from server')
      }

      // Validate each data center has required structure
      for (const dc of data) {
        if (!dc.id || !dc.name || !Array.isArray(dc.racks)) {
          throw new Error(`Invalid data center structure: ${dc.id || 'unknown'}`)
        }
        for (const rack of dc.racks) {
          if (!rack.id || !Array.isArray(rack.servers)) {
            throw new Error(`Invalid rack structure: ${rack.id || 'unknown'}`)
          }
          for (const server of rack.servers) {
            if (!server.id || !Array.isArray(server.containers)) {
              throw new Error(`Invalid server structure: ${server.id || 'unknown'}`)
            }
          }
        }
      }

      setDataCenters(data)
      setLastUpdate(new Date())
      setLoading(false)
      setError(null)
      setConnectionStatus('online')
    } catch (err) {
      console.error('Failed to fetch data centers:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data centers'
      setError(errorMessage)
      setConnectionStatus('offline')

      if (dataCenters.length === 0) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchDataCenters()

    // Set up optimized polling every 1 second
    const interval = setInterval(() => {
      // Only poll if we're not currently reconnecting and have no errors
      if (connectionStatus !== 'reconnecting') {
        fetchDataCenters()
      }
    }, 1000)

    // Cleanup function
    return () => {
      clearInterval(interval)
    }
  }, [connectionStatus]) // Re-setup polling when connection status changes

  // Enhanced selection state preservation during data updates
  useEffect(() => {
    if (selectedDataCenter && dataCenters.length > 0) {
      const updatedDC = dataCenters.find(dc => dc.id === selectedDataCenter.id);
      if (updatedDC) {
        // Preserve data center selection with updated data
        setSelectedDataCenter(updatedDC);

        if (selectedRack) {
          const updatedRack = updatedDC.racks.find(r => r.id === selectedRack.id);
          if (updatedRack) {
            // Preserve rack selection with updated data
            setSelectedRack(updatedRack);

            if (selectedServer) {
              const updatedServer = updatedRack.servers.find(s => s.id === selectedServer.id);
              if (updatedServer) {
                // Preserve server selection with updated data
                setSelectedServer(updatedServer);

                // Log state preservation for debugging
                console.log(`State preserved: DC=${updatedDC.name}, Rack=${updatedRack.name}, Server=${updatedServer.name}`);
              } else {
                // Server no longer exists, reset to rack level
                console.warn(`Server ${selectedServer.id} no longer exists, resetting to rack level`);
                setSelectedServer(null);
                setViewMode('servers');
              }
            }
          } else {
            // Rack no longer exists, reset to data center level
            console.warn(`Rack ${selectedRack.id} no longer exists, resetting to data center level`);
            setSelectedRack(null);
            setSelectedServer(null);
            setViewMode('racks');
          }
        }
      } else {
        // Data center no longer exists, reset to overview
        console.warn(`Data center ${selectedDataCenter.id} no longer exists, resetting to overview`);
        setSelectedDataCenter(null);
        setSelectedRack(null);
        setSelectedServer(null);
        setViewMode('overview');
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
    const actionMessages = {
      start: { title: 'Start Server', message: `Are you sure you want to start ${server.name}?`, variant: 'default' as const },
      stop: { title: 'Stop Server', message: `Are you sure you want to stop ${server.name}? This will stop all running containers.`, variant: 'warning' as const },
      restart: { title: 'Restart Server', message: `Are you sure you want to restart ${server.name}? This may cause temporary downtime.`, variant: 'warning' as const }
    };

    const actionConfig = actionMessages[action];

    setConfirmationDialog({
      isOpen: true,
      title: actionConfig.title,
      message: actionConfig.message,
      variant: actionConfig.variant,
      onConfirm: async () => {
        setConfirmationDialog(prev => ({ ...prev, isOpen: false }));

        try {
          console.log(`Server action: ${action} on ${server.name}`);
          const response = await fetch(`http://localhost:3001/api/servers/${server.id}/${action}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${action} server`);
          }

          const result = await response.json();
          console.log(`Server ${action} result:`, result);

          // Show success toast
          addToast({
            type: 'success',
            title: 'Server Operation Success',
            message: result.message
          });

          // Data will be updated automatically through polling
        } catch (error) {
          console.error(`Error performing ${action} on server ${server.name}:`, error);
          // Show error toast
          addToast({
            type: 'error',
            title: 'Server Operation Failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      }
    });
  }, [addToast]);

  const handleContainerAction = useCallback((container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => {
    const actionMessages = {
      start: { title: 'Start Container', message: `Are you sure you want to start ${container.name}?`, variant: 'default' as const },
      stop: { title: 'Stop Container', message: `Are you sure you want to stop ${container.name}?`, variant: 'warning' as const },
      pause: { title: 'Pause Container', message: `Are you sure you want to pause ${container.name}?`, variant: 'warning' as const },
      remove: { title: 'Remove Container', message: `Are you sure you want to remove ${container.name}? This action cannot be undone.`, variant: 'danger' as const }
    };

    const actionConfig = actionMessages[action];

    setConfirmationDialog({
      isOpen: true,
      title: actionConfig.title,
      message: actionConfig.message,
      variant: actionConfig.variant,
      onConfirm: async () => {
        setConfirmationDialog(prev => ({ ...prev, isOpen: false }));

        try {
          console.log(`Container action: ${action} on ${container.name}`);

          let response: Response;
          if (action === 'remove') {
            response = await fetch(`http://localhost:3001/api/containers/${container.id}`, {
              method: 'DELETE'
            });
          } else {
            response = await fetch(`http://localhost:3001/api/containers/${container.id}/${action}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${action} container`);
          }

          const result = await response.json();
          console.log(`Container ${action} result:`, result);

          // Show success toast
          addToast({
            type: 'success',
            title: 'Container Operation Success',
            message: result.message
          });

          // Data will be updated automatically through polling
        } catch (error) {
          console.error(`Error performing ${action} on container ${container.name}:`, error);
          // Show error toast
          addToast({
            type: 'error',
            title: 'Container Operation Failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      }
    });
  }, [addToast]);

  const handleAddContainer = useCallback(async (serverId: string) => {
    try {
      console.log(`Add container to server: ${serverId}`);

      const response = await fetch('http://localhost:3001/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serverId,
          image: 'nginx:latest',
          name: `container-${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add container');
      }

      const result = await response.json();
      console.log('Add container result:', result);

      // Show success toast
      addToast({
        type: 'success',
        title: 'Container Added',
        message: result.message
      });

      // Data will be updated automatically through polling
    } catch (error) {
      console.error(`Error adding container to server ${serverId}:`, error);
      // Show error toast
      addToast({
        type: 'error',
        title: 'Failed to Add Container',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [addToast]);

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

  const handleDialogCancel = useCallback(() => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

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
      <div className="app">
        <header className="app-header">
          <h1>Data Center Monitoring Dashboard</h1>
          <p className="app-subtitle">Connection Error - Attempting to reconnect...</p>
        </header>

        <main className="app-main">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <h2 style={{ color: '#f44336', marginBottom: '1rem' }}>Connection Failed</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                  Troubleshooting steps:
                </p>
                <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '0.85rem', color: '#666' }}>
                  <li>Ensure API server is running on port 3001</li>
                  <li>Check network connectivity</li>
                  <li>Verify CORS configuration</li>
                  <li>Check browser console for detailed errors</li>
                </ul>
              </div>
              <button
                className="retry-button"
                onClick={fetchDataCenters}
                disabled={connectionStatus === 'reconnecting'}
              >
                {connectionStatus === 'reconnecting' ? '🔄 Connecting...' : '🔄 Retry Connection'}
              </button>
            </div>
          </div>
        </main>

        <ConnectionIndicator status={connectionStatus} lastUpdate={lastUpdate} />
      </div>
    )
  }

  const renderCurrentView = useCallback(() => {
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
  }, [viewMode, dataCenters, selectedDataCenter, selectedRack, selectedServer, handleDataCenterSelect, handleRackSelect, handleServerSelect, handleServerAction, handleContainerAction, handleAddContainer, handleBack]);

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

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        variant={confirmationDialog.variant}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={handleDialogCancel}
      />

      <NotificationToast
        messages={toastMessages}
        onRemove={removeToast}
      />
    </div>
  )
}

export default App
