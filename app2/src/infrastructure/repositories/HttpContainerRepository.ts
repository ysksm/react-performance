import { Container } from '../../domain/entities/Container';
import { ContainerId, ServerId } from '../../domain/value-objects';
import type { IContainerRepository } from '../../domain/repositories/IContainerRepository';

export class HttpContainerRepository implements IContainerRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async findById(_id: ContainerId): Promise<Container | null> {
    // TODO: Implement findById operation
    console.log('FindById called for container:', _id.value);
    throw new Error('FindById operation not implemented for HTTP container repository');
  }

  async save(_container: Container): Promise<void> {
    // TODO: Implement save operation
    console.log('Save called for container:', _container.id.value);
    throw new Error('Save operation not implemented for HTTP container repository');
  }

  async create(serverId: ServerId): Promise<Container> {
    try {
      const response = await fetch(`${this.baseUrl}/api/servers/${serverId.value}/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const _containerData = await response.json();
      // TODO: Implement proper container data mapping
      console.log('Container data received:', _containerData);

      throw new Error('Container creation response mapping not implemented');
    } catch (error) {
      console.error(`Error creating container for server ${serverId.value}:`, error);
      throw new Error('Failed to create container');
    }
  }

  async executeAction(id: ContainerId, action: 'start' | 'stop' | 'pause' | 'remove'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/containers/${id.value}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error executing ${action} on container ${id.value}:`, error);
      throw new Error(`Failed to ${action} container`);
    }
  }
}