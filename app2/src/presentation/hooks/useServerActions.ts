import { useCallback } from 'react';
import { container } from '../../infrastructure/di/Container';
import { TOKENS } from '../../infrastructure/di/ServiceRegistry';
import type { IManageServerUseCase } from '../../application/use-cases/ManageServerUseCase';

export interface UseServerActionsResult {
  executeServerAction: (serverId: string, action: 'start' | 'stop' | 'restart') => Promise<void>;
}

export function useServerActions(): UseServerActionsResult {
  const manageServerUseCase = container.resolve<IManageServerUseCase>(TOKENS.MANAGE_SERVER_USE_CASE);

  const executeServerAction = useCallback(async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await manageServerUseCase.executeAction(serverId, action);
    } catch (error) {
      console.error(`Failed to ${action} server ${serverId}:`, error);
      throw error;
    }
  }, [manageServerUseCase]);

  return {
    executeServerAction,
  };
}