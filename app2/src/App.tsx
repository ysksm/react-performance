import { useState, useEffect } from 'react'
import './App.css'
import Grid from './components/Grid'
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

  const handleCellClick = (server: ServerData) => {
    setSelectedServer(server)
    console.log('Selected server:', server)
  }

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
      <Grid servers={servers} onCellClick={handleCellClick} />
      {selectedServer && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#333',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Selected: {selectedServer.id}
        </div>
      )}
    </div>
  )
}

export default App
