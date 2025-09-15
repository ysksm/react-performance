import express from 'express';
import cors from 'cors';
import { ServerData } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Generate random server data
function generateServerData(id: string): ServerData {
  return {
    id,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    errors: Math.random() > 0.8 ? ['Error: Connection timeout', 'Warning: High CPU usage'] : []
  };
}

// Generate 100 servers (10x10 grid)
function generateAllServersData(): ServerData[] {
  const servers: ServerData[] = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const id = `server-${row}-${col}`;
      servers.push(generateServerData(id));
    }
  }
  return servers;
}

// Routes
app.get('/api/servers', (_req, res) => {
  const servers = generateAllServersData();
  res.json(servers);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/servers`);
});

export default app;