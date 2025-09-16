import { Server } from './Server';
import { RackId, RackName, Position } from '../value-objects';

export class Rack {
  private readonly _id: RackId;
  private readonly _name: RackName;
  private readonly _position: Position;
  private readonly _servers: Server[];

  constructor(
    id: RackId,
    name: RackName,
    position: Position,
    servers: Server[]
  ) {
    this._id = id;
    this._name = name;
    this._position = position;
    this._servers = servers;
  }

  get id(): RackId {
    return this._id;
  }

  get name(): RackName {
    return this._name;
  }

  get position(): Position {
    return this._position;
  }

  get servers(): Server[] {
    return [...this._servers];
  }

  getServerCount(): number {
    return this._servers.length;
  }

  getTotalContainers(): number {
    return this._servers.reduce((total, server) => total + server.getContainerCount(), 0);
  }

  getHealthStatus(): 'healthy' | 'warning' | 'error' {
    const errorServers = this._servers.filter(server => server.getHealthStatus() === 'error');
    const warningServers = this._servers.filter(server => server.getHealthStatus() === 'warning');

    if (errorServers.length > 0) return 'error';
    if (warningServers.length > 0) return 'warning';
    return 'healthy';
  }

  getRunningServers(): Server[] {
    return this._servers.filter(server => server.isRunning());
  }

  getServerById(serverId: string): Server | undefined {
    return this._servers.find(server => server.id.value === serverId);
  }

  equals(other: Rack): boolean {
    return this._id.equals(other._id);
  }
}