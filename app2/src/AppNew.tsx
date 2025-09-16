import { useState, useCallback } from 'react'
import './App.css'
import './styles/Desktop.css'
// Page components
import { DataCenterOverview } from './pages/DataCenterOverview'
import { RackListView } from './pages/RackListView'
import { ServerGridView } from './pages/ServerGridView'
import { ContainerManageView } from './pages/ContainerManageView'

// Layout components
import { NavigationBreadcrumb, ConnectionIndicator } from './components/layout'

// Common UI components
import { ConfirmationDialog, NotificationToast } from './components/common'
import type { ToastMessage } from './components/common/NotificationToast'
import { useDataCenters } from './presentation/hooks/useDataCenters'
import { useServerActions } from './presentation/hooks/useServerActions'
import { useContainerActions } from './presentation/hooks/useContainerActions'
import type { DataCenter, Rack, Server, Container, ViewMode } from './types/ServerData'

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'default' | 'warning' | 'danger';
  onConfirm: () => void;
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default',
    onConfirm: () => {}
  });

  const { dataCenters, loading, connectionStatus, lastUpdate } = useDataCenters();

  // Debug log
  console.log('AppNew - dataCenters:', dataCenters, 'loading:', loading);
  const { executeServerAction } = useServerActions();
  const { executeContainerAction, createContainer } = useContainerActions();

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToastMessages(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToastMessages(prev => prev.filter(toast => toast.id !== id));
  }, []);

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
      restart: { title: 'Restart Server', message: `Are you sure you want to restart ${server.name}? This will temporarily interrupt all services.`, variant: 'warning' as const }
    };

    const { title, message, variant } = actionMessages[action];

    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        try {
          await executeServerAction(server.id, action);
          addToast({
            type: 'success',
            title: 'Action Completed',
            message: `Server ${action} operation completed successfully`,
          });
        } catch (error) {
          addToast({
            type: 'error',
            title: 'Action Failed',
            message: `Failed to ${action} server: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        } finally {
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  }, [executeServerAction, addToast]);

  const handleContainerAction = useCallback((container: Container, action: 'start' | 'stop' | 'pause' | 'remove') => {
    const actionMessages = {
      start: { title: 'Start Container', message: `Are you sure you want to start ${container.name}?`, variant: 'default' as const },
      stop: { title: 'Stop Container', message: `Are you sure you want to stop ${container.name}?`, variant: 'warning' as const },
      pause: { title: 'Pause Container', message: `Are you sure you want to pause ${container.name}?`, variant: 'default' as const },
      remove: { title: 'Remove Container', message: `Are you sure you want to remove ${container.name}? This action cannot be undone.`, variant: 'danger' as const }
    };

    const { title, message, variant } = actionMessages[action];

    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        try {
          await executeContainerAction(container.id, action);
          addToast({
            type: 'success',
            title: 'Action Completed',
            message: `Container ${action} operation completed successfully`,
          });
        } catch (error) {
          addToast({
            type: 'error',
            title: 'Action Failed',
            message: `Failed to ${action} container: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        } finally {
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  }, [executeContainerAction, addToast]);

  const handleAddContainer = useCallback(async (serverId: string) => {
    try {
      await createContainer(serverId);
      addToast({
        type: 'success',
        title: 'Container Created',
        message: 'New container has been created successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: `Failed to create container: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [createContainer, addToast]);

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

  console.log('AppNew - render check - loading:', loading, 'dataCenters.length:', dataCenters.length);

  if (loading && dataCenters.length === 0) {
    console.log('Showing loading screen');
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data centers...</p>
        </div>
      </div>
    );
  }

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
  );
}

export default App;