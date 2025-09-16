export interface DataCenter {
  id: string;
  name: string;
  location: string;
  racks: Rack[];
}

export interface Rack {
  id: string;
  name: string;
  position: number;
  servers: Server[];
}

export interface Server {
  id: string;
  name: string;
  position: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  errors: string[];
  status: 'running' | 'warning' | 'error' | 'maintenance';
  containers: Container[];
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  cpu: number;
  memory: number;
  ports: string[];
  createdAt: string;
}

// Legacy interface for backward compatibility
export interface ServerData {
  id: string;
  cpu: number;
  memory: number;
  disk: number;
  errors: string[];
}