import { Server } from '../../domain/entities/Server';
import { ServerId } from '../../domain/value-objects';
import type { IServerRepository } from '../../domain/repositories/IServerRepository';

export class HttpServerRepository implements IServerRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async findById(_id: ServerId): Promise<Server | null> {
    // TODO: Implement findById operation
    console.log('FindById called for server:', _id.value);
    throw new Error('FindById operation not implemented for HTTP server repository');
  }

  async save(_server: Server): Promise<void> {
    // TODO: Implement save operation
    console.log('Save called for server:', _server.id.value);
    throw new Error('Save operation not implemented for HTTP server repository');
  }

  async executeAction(id: ServerId, action: 'start' | 'stop' | 'restart'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/servers/${id.value}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error executing ${action} on server ${id.value}:`, error);
      throw new Error(`Failed to ${action} server`);
    }
  }
}