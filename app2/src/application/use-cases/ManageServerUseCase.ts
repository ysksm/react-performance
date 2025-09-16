import { ServerId } from '../../domain/value-objects';
import type { IServerRepository } from '../../domain/repositories/IServerRepository';

export interface IManageServerUseCase {
  executeAction(serverId: string, action: 'start' | 'stop' | 'restart'): Promise<void>;
}

export class ManageServerUseCase implements IManageServerUseCase {
  private readonly serverRepository: IServerRepository;

  constructor(serverRepository: IServerRepository) {
    this.serverRepository = serverRepository;
  }

  async executeAction(serverId: string, action: 'start' | 'stop' | 'restart'): Promise<void> {
    try {
      const serverIdVO = new ServerId(serverId);
      await this.serverRepository.executeAction(serverIdVO, action);
    } catch (error) {
      console.error(`Failed to ${action} server ${serverId}:`, error);
      throw new Error(`Unable to ${action} server`);
    }
  }
}