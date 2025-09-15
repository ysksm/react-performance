import type { ServerData } from './types/ServerData';

export function generateMockServers(): ServerData[] {
  const servers: ServerData[] = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      servers.push({
        id: `server-${row}-${col}`,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        errors: Math.random() > 0.8 ? ['Error: Connection timeout'] : []
      });
    }
  }
  return servers;
}