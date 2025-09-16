import { Container } from '../entities/Container';
import { ContainerId, ServerId } from '../value-objects';

export interface IContainerRepository {
  findById(id: ContainerId): Promise<Container | null>;
  save(container: Container): Promise<void>;
  create(serverId: ServerId): Promise<Container>;
  executeAction(id: ContainerId, action: 'start' | 'stop' | 'pause' | 'remove'): Promise<void>;
}