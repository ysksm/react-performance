import { Container } from '../../domain/entities/Container';
import { ContainerId, ServerId } from '../../domain/value-objects';
import type { IContainerRepository } from '../../domain/repositories/IContainerRepository';

export interface IManageContainerUseCase {
  executeAction(containerId: string, action: 'start' | 'stop' | 'pause' | 'remove'): Promise<void>;
  createContainer(serverId: string): Promise<Container>;
}

export class ManageContainerUseCase implements IManageContainerUseCase {
  private readonly containerRepository: IContainerRepository;

  constructor(containerRepository: IContainerRepository) {
    this.containerRepository = containerRepository;
  }

  async executeAction(containerId: string, action: 'start' | 'stop' | 'pause' | 'remove'): Promise<void> {
    try {
      const containerIdVO = new ContainerId(containerId);
      await this.containerRepository.executeAction(containerIdVO, action);
    } catch (error) {
      console.error(`Failed to ${action} container ${containerId}:`, error);
      throw new Error(`Unable to ${action} container`);
    }
  }

  async createContainer(serverId: string): Promise<Container> {
    try {
      const serverIdVO = new ServerId(serverId);
      return await this.containerRepository.create(serverIdVO);
    } catch (error) {
      console.error(`Failed to create container for server ${serverId}:`, error);
      throw new Error('Unable to create container');
    }
  }
}