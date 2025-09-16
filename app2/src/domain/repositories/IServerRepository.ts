import { Server } from '../entities/Server';
import { ServerId } from '../value-objects';

export interface IServerRepository {
  findById(id: ServerId): Promise<Server | null>;
  save(server: Server): Promise<void>;
  executeAction(id: ServerId, action: 'start' | 'stop' | 'restart'): Promise<void>;
}