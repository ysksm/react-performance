import express from 'express';
import cors from 'cors';
import { DataCenter, Rack, Server, Container, ServerData } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Persistent state for realistic data evolution
let dataState: DataCenter[] = [];
let lastUpdateTime = Date.now();

// Generate random container data with more realistic evolution
function generateContainer(serverId: string, index: number, existingContainer?: Container): Container {
  const images = ['nginx:latest', 'redis:alpine', 'postgres:13', 'node:18', 'python:3.9', 'mongodb:latest'];
  const ports = ['8080:80', '3000:3000', '5432:5432', '6379:6379', '27017:27017'];

  if (existingContainer) {
    // Evolve existing container with small changes
    const cpuChange = (Math.random() - 0.5) * 5; // ±2.5% change
    const memoryChange = (Math.random() - 0.5) * 3; // ±1.5% change

    return {
      ...existingContainer,
      cpu: Math.max(0, Math.min(100, existingContainer.cpu + cpuChange)),
      memory: Math.max(0, Math.min(100, existingContainer.memory + memoryChange)),
      // Status changes very rarely
      status: Math.random() > 0.998 ?
        (['running', 'stopped', 'paused', 'error'][Math.floor(Math.random() * 4)] as any) :
        existingContainer.status
    };
  }

  return {
    id: `${serverId}-container-${index}`,
    name: `container-${index}`,
    image: images[Math.floor(Math.random() * images.length)],
    status: Math.random() > 0.05 ? 'running' : ['stopped', 'paused', 'error'][Math.floor(Math.random() * 3)] as any,
    cpu: Math.random() * 50,
    memory: Math.random() * 30,
    ports: [ports[Math.floor(Math.random() * ports.length)]],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Generate random server data with evolution support
function generateServer(rackId: string, position: number, existingServer?: Server): Server {
  const serverId = `${rackId}-server-${position}`;

  if (existingServer) {
    // Evolve existing server with realistic changes
    const cpuChange = (Math.random() - 0.5) * 8; // ±4% change
    const memoryChange = (Math.random() - 0.5) * 6; // ±3% change
    const diskChange = (Math.random() - 0.5) * 2; // ±1% change
    const networkChange = (Math.random() - 0.5) * 10; // ±5% change
    const tempChange = (Math.random() - 0.5) * 4; // ±2°C change

    const newCpu = Math.max(0, Math.min(100, existingServer.cpu + cpuChange));
    const newMemory = Math.max(0, Math.min(100, existingServer.memory + memoryChange));
    const newDisk = Math.max(0, Math.min(100, existingServer.disk + diskChange));
    const newNetwork = Math.max(0, Math.min(100, existingServer.network + networkChange));
    const newTemp = Math.max(15, Math.min(85, existingServer.temperature + tempChange));

    // Update containers
    const containers: Container[] = [];
    for (let i = 0; i < existingServer.containers.length; i++) {
      containers.push(generateContainer(serverId, i, existingServer.containers[i]));
    }

    // Occasionally add or remove containers
    if (Math.random() > 0.98 && containers.length < 6) {
      containers.push(generateContainer(serverId, containers.length));
    } else if (Math.random() > 0.99 && containers.length > 2) {
      containers.pop();
    }

    const hasErrors = newCpu > 90 || newMemory > 90 || newTemp > 80 || Math.random() > 0.998;
    const hasWarnings = newCpu > 75 || newMemory > 75 || newTemp > 70;

    return {
      ...existingServer,
      cpu: newCpu,
      memory: newMemory,
      disk: newDisk,
      network: newNetwork,
      temperature: newTemp,
      errors: hasErrors ? ['Error: Connection timeout', 'Warning: High CPU usage'] : [],
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'running',
      containers
    };
  }

  // Generate new server
  const containerCount = Math.floor(Math.random() * 4) + 2; // 2-5 containers
  const containers: Container[] = [];

  for (let i = 0; i < containerCount; i++) {
    containers.push(generateContainer(serverId, i));
  }

  const cpu = Math.random() * 100;
  const memory = Math.random() * 100;
  const hasErrors = Math.random() > 0.97;

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

// Generate rack data with evolution support
function generateRack(dataCenterId: string, position: number, existingRack?: Rack): Rack {
  const rackId = `${dataCenterId}-rack-${position}`;
  const servers: Server[] = [];

  if (existingRack) {
    // Evolve existing rack by updating its servers
    for (let i = 0; i < 8; i++) { // 8 servers per rack
      const existingServer = existingRack.servers.find(s => s.position === i);
      servers.push(generateServer(rackId, i, existingServer));
    }
  } else {
    // Generate new rack
    for (let i = 0; i < 8; i++) { // 8 servers per rack
      servers.push(generateServer(rackId, i));
    }
  }

  return {
    id: rackId,
    name: `Rack-${position}`,
    position,
    servers
  };
}

// Generate data center with evolution support
function generateDataCenter(id: string, name: string, location: string, existingDataCenter?: DataCenter): DataCenter {
  const racks: Rack[] = [];

  if (existingDataCenter) {
    // Evolve existing data center by updating its racks
    for (let i = 0; i < 5; i++) { // 5 racks per data center
      const existingRack = existingDataCenter.racks.find(r => r.position === i);
      racks.push(generateRack(id, i, existingRack));
    }
  } else {
    // Generate new data center
    for (let i = 0; i < 5; i++) { // 5 racks per data center
      racks.push(generateRack(id, i));
    }
  }

  return {
    id,
    name,
    location,
    racks
  };
}

// Generate all data centers with evolution and state persistence
function generateAllDataCenters(): DataCenter[] {
  const now = Date.now();

  // Initialize state if empty or if it's been too long since last update
  if (dataState.length === 0 || (now - lastUpdateTime) > 300000) { // 5 minutes reset
    dataState = [
      generateDataCenter('dc-tokyo', 'Tokyo DC', 'Tokyo, Japan'),
      generateDataCenter('dc-oregon', 'Oregon DC', 'Oregon, USA'),
      generateDataCenter('dc-ireland', 'Ireland DC', 'Dublin, Ireland')
    ];
  } else {
    // Evolve existing state
    dataState = [
      generateDataCenter('dc-tokyo', 'Tokyo DC', 'Tokyo, Japan', dataState.find(dc => dc.id === 'dc-tokyo')),
      generateDataCenter('dc-oregon', 'Oregon DC', 'Oregon, USA', dataState.find(dc => dc.id === 'dc-oregon')),
      generateDataCenter('dc-ireland', 'Ireland DC', 'Dublin, Ireland', dataState.find(dc => dc.id === 'dc-ireland'))
    ];
  }

  lastUpdateTime = now;
  return dataState;
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

// New hierarchical data endpoint with enhanced monitoring
app.get('/api/datacenters', (_req, res) => {
  try {
    const startTime = Date.now();
    const datacenters = generateAllDataCenters();
    const processingTime = Date.now() - startTime;

    // Add metadata headers for monitoring
    res.setHeader('X-Data-Generation-Time', processingTime.toString());
    res.setHeader('X-Data-Timestamp', new Date().toISOString());
    res.setHeader('X-Total-Entities', getTotalEntityCount(datacenters).toString());

    // Enhanced CORS headers for better client compatibility
    res.setHeader('Access-Control-Expose-Headers', 'X-Data-Generation-Time,X-Data-Timestamp,X-Total-Entities');

    console.log(`Generated hierarchical data: ${datacenters.length} DCs, processing time: ${processingTime}ms`);
    res.json(datacenters);
  } catch (error) {
    console.error('Error generating datacenter data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate datacenter data',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to count total entities
function getTotalEntityCount(datacenters: DataCenter[]): number {
  let total = datacenters.length; // Data centers
  datacenters.forEach(dc => {
    total += dc.racks.length; // Racks
    dc.racks.forEach(rack => {
      total += rack.servers.length; // Servers
      rack.servers.forEach(server => {
        total += server.containers.length; // Containers
      });
    });
  });
  return total;
}

// Legacy endpoint for backward compatibility
app.get('/api/servers', (_req, res) => {
  const servers = generateAllServersData();
  res.json(servers);
});

// Server operation endpoints
app.post('/api/servers/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Starting server: ${id}`);

    // Find the server in dataState
    let serverFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        const server = rack.servers.find(s => s.id === id);
        if (server) {
          server.status = 'running';
          server.errors = [];
          serverFound = true;
          console.log(`Server ${id} started successfully`);
          break;
        }
      }
      if (serverFound) break;
    }

    if (!serverFound) {
      return res.status(404).json({
        error: 'Server not found',
        message: `Server with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Server ${id} started successfully`,
      timestamp: new Date().toISOString(),
      action: 'start',
      serverId: id
    });
  } catch (error) {
    console.error('Error starting server:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to start server',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/servers/:id/stop', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Stopping server: ${id}`);

    // Find the server in dataState
    let serverFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        const server = rack.servers.find(s => s.id === id);
        if (server) {
          server.status = 'maintenance';
          // Stop all containers
          server.containers.forEach(container => {
            if (container.status === 'running') {
              container.status = 'stopped';
            }
          });
          serverFound = true;
          console.log(`Server ${id} stopped successfully`);
          break;
        }
      }
      if (serverFound) break;
    }

    if (!serverFound) {
      return res.status(404).json({
        error: 'Server not found',
        message: `Server with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Server ${id} stopped successfully`,
      timestamp: new Date().toISOString(),
      action: 'stop',
      serverId: id
    });
  } catch (error) {
    console.error('Error stopping server:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to stop server',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/servers/:id/restart', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Restarting server: ${id}`);

    // Find the server in dataState
    let serverFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        const server = rack.servers.find(s => s.id === id);
        if (server) {
          // Simulate restart process
          server.status = 'maintenance';
          server.errors = [];

          // Restart containers with delay simulation
          setTimeout(() => {
            server.status = 'running';
            server.containers.forEach(container => {
              if (container.status === 'stopped') {
                container.status = Math.random() > 0.02 ? 'running' : 'error';
              }
            });
          }, 2000);

          serverFound = true;
          console.log(`Server ${id} restart initiated`);
          break;
        }
      }
      if (serverFound) break;
    }

    if (!serverFound) {
      return res.status(404).json({
        error: 'Server not found',
        message: `Server with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Server ${id} restart initiated`,
      timestamp: new Date().toISOString(),
      action: 'restart',
      serverId: id
    });
  } catch (error) {
    console.error('Error restarting server:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to restart server',
      timestamp: new Date().toISOString()
    });
  }
});

// Container operation endpoints
app.post('/api/containers', (req, res) => {
  try {
    const { serverId, image = 'nginx:latest', name } = req.body;

    if (!serverId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'serverId is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Adding container to server: ${serverId}`);

    // Find the server in dataState
    let serverFound = false;
    let newContainer: Container | null = null;

    for (const dc of dataState) {
      for (const rack of dc.racks) {
        const server = rack.servers.find(s => s.id === serverId);
        if (server) {
          // Generate new container
          const containerIndex = server.containers.length;
          const containerName = name || `container-${containerIndex}`;
          newContainer = generateContainer(serverId, containerIndex);
          newContainer.name = containerName;
          newContainer.image = image;

          server.containers.push(newContainer);
          serverFound = true;
          console.log(`Container ${newContainer.id} added to server ${serverId}`);
          break;
        }
      }
      if (serverFound) break;
    }

    if (!serverFound) {
      return res.status(404).json({
        error: 'Server not found',
        message: `Server with ID ${serverId} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: `Container added to server ${serverId}`,
      timestamp: new Date().toISOString(),
      action: 'add',
      container: newContainer
    });
  } catch (error) {
    console.error('Error adding container:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add container',
      timestamp: new Date().toISOString()
    });
  }
});

app.delete('/api/containers/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Removing container: ${id}`);

    // Find and remove the container from dataState
    let containerFound = false;
    let removedContainer: Container | null = null;

    for (const dc of dataState) {
      for (const rack of dc.racks) {
        for (const server of rack.servers) {
          const containerIndex = server.containers.findIndex(c => c.id === id);
          if (containerIndex !== -1) {
            removedContainer = server.containers[containerIndex];
            server.containers.splice(containerIndex, 1);
            containerFound = true;
            console.log(`Container ${id} removed from server ${server.id}`);
            break;
          }
        }
        if (containerFound) break;
      }
      if (containerFound) break;
    }

    if (!containerFound) {
      return res.status(404).json({
        error: 'Container not found',
        message: `Container with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Container ${id} removed successfully`,
      timestamp: new Date().toISOString(),
      action: 'remove',
      container: removedContainer
    });
  } catch (error) {
    console.error('Error removing container:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove container',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/containers/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Starting container: ${id}`);

    // Find the container in dataState
    let containerFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        for (const server of rack.servers) {
          const container = server.containers.find(c => c.id === id);
          if (container) {
            container.status = 'running';
            containerFound = true;
            console.log(`Container ${id} started successfully`);
            break;
          }
        }
        if (containerFound) break;
      }
      if (containerFound) break;
    }

    if (!containerFound) {
      return res.status(404).json({
        error: 'Container not found',
        message: `Container with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Container ${id} started successfully`,
      timestamp: new Date().toISOString(),
      action: 'start',
      containerId: id
    });
  } catch (error) {
    console.error('Error starting container:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to start container',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/containers/:id/stop', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Stopping container: ${id}`);

    // Find the container in dataState
    let containerFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        for (const server of rack.servers) {
          const container = server.containers.find(c => c.id === id);
          if (container) {
            container.status = 'stopped';
            containerFound = true;
            console.log(`Container ${id} stopped successfully`);
            break;
          }
        }
        if (containerFound) break;
      }
      if (containerFound) break;
    }

    if (!containerFound) {
      return res.status(404).json({
        error: 'Container not found',
        message: `Container with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Container ${id} stopped successfully`,
      timestamp: new Date().toISOString(),
      action: 'stop',
      containerId: id
    });
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to stop container',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/containers/:id/pause', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Pausing container: ${id}`);

    // Find the container in dataState
    let containerFound = false;
    for (const dc of dataState) {
      for (const rack of dc.racks) {
        for (const server of rack.servers) {
          const container = server.containers.find(c => c.id === id);
          if (container) {
            container.status = 'paused';
            containerFound = true;
            console.log(`Container ${id} paused successfully`);
            break;
          }
        }
        if (containerFound) break;
      }
      if (containerFound) break;
    }

    if (!containerFound) {
      return res.status(404).json({
        error: 'Container not found',
        message: `Container with ID ${id} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Container ${id} paused successfully`,
      timestamp: new Date().toISOString(),
      action: 'pause',
      containerId: id
    });
  } catch (error) {
    console.error('Error pausing container:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to pause container',
      timestamp: new Date().toISOString()
    });
  }
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