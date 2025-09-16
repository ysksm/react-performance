import express from 'express';
import cors from 'cors';
import { DataCenter, Rack, Server, Container, ServerData } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Generate random container data
function generateContainer(serverId: string, index: number): Container {
  const images = ['nginx:latest', 'redis:alpine', 'postgres:13', 'node:18', 'python:3.9', 'mongodb:latest'];
  const ports = ['8080:80', '3000:3000', '5432:5432', '6379:6379', '27017:27017'];

  return {
    id: `${serverId}-container-${index}`,
    name: `container-${index}`,
    image: images[Math.floor(Math.random() * images.length)],
    status: Math.random() > 0.1 ? 'running' : ['stopped', 'paused', 'error'][Math.floor(Math.random() * 3)] as any,
    cpu: Math.random() * 50,
    memory: Math.random() * 30,
    ports: [ports[Math.floor(Math.random() * ports.length)]],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Generate random server data
function generateServer(rackId: string, position: number): Server {
  const serverId = `${rackId}-server-${position}`;
  const containerCount = Math.floor(Math.random() * 4) + 2; // 2-5 containers
  const containers: Container[] = [];

  for (let i = 0; i < containerCount; i++) {
    containers.push(generateContainer(serverId, i));
  }

  const cpu = Math.random() * 100;
  const memory = Math.random() * 100;
  const hasErrors = Math.random() > 0.85;

  return {
    id: serverId,
    name: `Server-${position}`,
    position,
    cpu,
    memory,
    disk: Math.random() * 100,
    network: Math.random() * 100,
    temperature: 20 + Math.random() * 60,
    errors: hasErrors ? ['Error: Connection timeout', 'Warning: High CPU usage'] : [],
    status: hasErrors ? 'error' : cpu > 80 ? 'warning' : 'running',
    containers
  };
}

// Generate rack data
function generateRack(dataCenterId: string, position: number): Rack {
  const rackId = `${dataCenterId}-rack-${position}`;
  const servers: Server[] = [];

  for (let i = 0; i < 8; i++) { // 8 servers per rack
    servers.push(generateServer(rackId, i));
  }

  return {
    id: rackId,
    name: `Rack-${position}`,
    position,
    servers
  };
}

// Generate data center
function generateDataCenter(id: string, name: string, location: string): DataCenter {
  const racks: Rack[] = [];

  for (let i = 0; i < 5; i++) { // 5 racks per data center
    racks.push(generateRack(id, i));
  }

  return {
    id,
    name,
    location,
    racks
  };
}

// Generate all data centers
function generateAllDataCenters(): DataCenter[] {
  return [
    generateDataCenter('dc-tokyo', 'Tokyo DC', 'Tokyo, Japan'),
    generateDataCenter('dc-oregon', 'Oregon DC', 'Oregon, USA'),
    generateDataCenter('dc-ireland', 'Ireland DC', 'Dublin, Ireland')
  ];
}

// Legacy function for backward compatibility
function generateServerData(id: string): ServerData {
  return {
    id,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    errors: Math.random() > 0.8 ? ['Error: Connection timeout', 'Warning: High CPU usage'] : []
  };
}

// Legacy function for backward compatibility
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

// New hierarchical data endpoint
app.get('/api/datacenters', (_req, res) => {
  const datacenters = generateAllDataCenters();
  res.json(datacenters);
});

// Legacy endpoint for backward compatibility
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
  console.log(`Hierarchical API: http://localhost:${PORT}/api/datacenters`);
  console.log(`Legacy API: http://localhost:${PORT}/api/servers`);
});

export default app;