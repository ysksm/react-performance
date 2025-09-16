import { useEffect, useCallback } from 'react';
import type { ServerData } from '../types/ServerData';

interface ModalProps {
  server: ServerData | null;
  onClose: () => void;
}

function Modal({ server, onClose }: ModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // ESCキーのイベントリスナー
  useEffect(() => {
    if (!server) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [server, handleKeyDown]);

  if (!server) return null;

  const getStatusColor = (value: number) => {
    if (value > 80) return '#ff4444';
    if (value > 60) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          minWidth: '400px',
          maxWidth: '600px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Server Details: {server.id}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>CPU Usage:</span>
            <span style={{ color: getStatusColor(server.cpu), fontWeight: 'bold' }}>
              {server.cpu.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${server.cpu}%`,
                height: '100%',
                backgroundColor: getStatusColor(server.cpu),
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Memory Usage:</span>
            <span style={{ color: getStatusColor(server.memory), fontWeight: 'bold' }}>
              {server.memory.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${server.memory}%`,
                height: '100%',
                backgroundColor: getStatusColor(server.memory),
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Disk Usage:</span>
            <span style={{ color: getStatusColor(server.disk), fontWeight: 'bold' }}>
              {server.disk.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${server.disk}%`,
                height: '100%',
                backgroundColor: getStatusColor(server.disk),
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '10px' }}>Errors ({server.errors.length})</h3>
          {server.errors.length === 0 ? (
            <p style={{ color: '#44ff44' }}>No errors detected</p>
          ) : (
            <ul style={{ color: '#ff4444', paddingLeft: '20px' }}>
              {server.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;