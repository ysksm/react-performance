import { container } from './Container';
import { HttpDataCenterRepository } from '../repositories/HttpDataCenterRepository';
import { HttpServerRepository } from '../repositories/HttpServerRepository';
import { HttpContainerRepository } from '../repositories/HttpContainerRepository';
import { GetDataCentersUseCase } from '../../application/use-cases/GetDataCentersUseCase';
import { ManageServerUseCase } from '../../application/use-cases/ManageServerUseCase';
import { ManageContainerUseCase } from '../../application/use-cases/ManageContainerUseCase';

export const TOKENS = {
  // Repositories
  DATA_CENTER_REPOSITORY: 'DataCenterRepository',
  SERVER_REPOSITORY: 'ServerRepository',
  CONTAINER_REPOSITORY: 'ContainerRepository',

  // Use Cases
  GET_DATA_CENTERS_USE_CASE: 'GetDataCentersUseCase',
  MANAGE_SERVER_USE_CASE: 'ManageServerUseCase',
  MANAGE_CONTAINER_USE_CASE: 'ManageContainerUseCase',

  // Configuration
  API_BASE_URL: 'ApiBaseUrl',
} as const;

export function setupDependencies(): void {
  const baseUrl = 'http://localhost:3001';

  // Register configuration
  container.register(TOKENS.API_BASE_URL, () => baseUrl);

  // Register repositories
  container.registerSingleton(
    TOKENS.DATA_CENTER_REPOSITORY,
    () => new HttpDataCenterRepository(container.resolve(TOKENS.API_BASE_URL))
  );

  container.registerSingleton(
    TOKENS.SERVER_REPOSITORY,
    () => new HttpServerRepository(container.resolve(TOKENS.API_BASE_URL))
  );

  container.registerSingleton(
    TOKENS.CONTAINER_REPOSITORY,
    () => new HttpContainerRepository(container.resolve(TOKENS.API_BASE_URL))
  );

  // Register use cases
  container.registerSingleton(
    TOKENS.GET_DATA_CENTERS_USE_CASE,
    () => new GetDataCentersUseCase(container.resolve(TOKENS.DATA_CENTER_REPOSITORY))
  );

  container.registerSingleton(
    TOKENS.MANAGE_SERVER_USE_CASE,
    () => new ManageServerUseCase(container.resolve(TOKENS.SERVER_REPOSITORY))
  );

  container.registerSingleton(
    TOKENS.MANAGE_CONTAINER_USE_CASE,
    () => new ManageContainerUseCase(container.resolve(TOKENS.CONTAINER_REPOSITORY))
  );
}