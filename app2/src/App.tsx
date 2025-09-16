import { useState, useEffect, useCallback } from 'react'
import './App.css'
// import Grid from './components/Grid'  // 非最適化版
import OptimizedGrid from './components/OptimizedGrid'  // 最適化版
import Modal from './components/Modal'
import type { ServerData } from './types/ServerData'

function App() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchServers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/servers')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServers(data)
      setLastUpdate(new Date())
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch servers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch servers')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchServers()

    // Set up polling every 1 second
    const interval = setInterval(fetchServers, 1000)

    // Cleanup function
    return () => {
      clearInterval(interval)
    }
  }, [])

  // 選択中のサーバーのデータを更新
  useEffect(() => {
    if (selectedServer) {
      const updatedServer = servers.find(s => s.id === selectedServer.id);
      if (updatedServer) {
        setSelectedServer(updatedServer);
      }
    }
  }, [servers, selectedServer?.id])

  // useCallbackで関数をメモ化
  const handleCellClick = useCallback((server: ServerData) => {
    // 選択されたサーバーのIDから最新のデータを取得
    const currentServer = servers.find(s => s.id === server.id);
    if (currentServer) {
      setSelectedServer(currentServer);
    }
  }, [servers])

  const handleCloseModal = useCallback(() => {
    setSelectedServer(null);
  }, [])

  if (loading && servers.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Server Monitoring Dashboard</h1>
        <p>Loading servers...</p>
      </div>
    )
  }

  if (error && servers.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Server Monitoring Dashboard</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Make sure the API server is running on port 3001</p>
        <button onClick={fetchServers}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Server Monitoring Dashboard</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Click on any server to view details |
        {lastUpdate && ` Last update: ${lastUpdate.toLocaleTimeString()}`}
        {error && <span style={{ color: 'orange' }}> (Connection issues)</span>}
      </p>
      <OptimizedGrid servers={servers} onCellClick={handleCellClick} />
      <Modal server={selectedServer} onClose={handleCloseModal} />
    </div>
  )
}

export default App
