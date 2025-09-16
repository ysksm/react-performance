import { useCallback } from 'react';
import { container } from '../../infrastructure/di/Container';
import { TOKENS } from '../../infrastructure/di/ServiceRegistry';
import type { IManageContainerUseCase } from '../../application/use-cases/ManageContainerUseCase';

export interface UseContainerActionsResult {
  executeContainerAction: (containerId: string, action: 'start' | 'stop' | 'pause' | 'remove') => Promise<void>;
  createContainer: (serverId: string) => Promise<void>;
}

export function useContainerActions(): UseContainerActionsResult {
  const manageContainerUseCase = container.resolve<IManageContainerUseCase>(TOKENS.MANAGE_CONTAINER_USE_CASE);

  const executeContainerAction = useCallback(async (containerId: string, action: 'start' | 'stop' | 'pause' | 'remove') => {
    try {
      await manageContainerUseCase.executeAction(containerId, action);
    } catch (error) {
      console.error(`Failed to ${action} container ${containerId}:`, error);
      throw error;
    }
  }, [manageContainerUseCase]);

  const createContainer = useCallback(async (serverId: string) => {
    try {
      await manageContainerUseCase.createContainer(serverId);
    } catch (error) {
      console.error(`Failed to create container for server ${serverId}:`, error);
      throw error;
    }
  }, [manageContainerUseCase]);

  return {
    executeContainerAction,
    createContainer,
  };
}