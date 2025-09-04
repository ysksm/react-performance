import { IGridRepository } from '../domain/repositories/IGridRepository.js';
import { InMemoryGridRepository } from './repositories/InMemoryGridRepository.js';
import { GridUseCase } from '../application/usecases/GridUseCase.js';

/**
 * 依存性注入のためのサービスロケーター
 */
export class ServiceLocator {
  private static _instance: ServiceLocator;
  private _gridRepository: IGridRepository;
  private _gridUseCase: GridUseCase;

  private constructor() {
    // リポジトリの初期化
    this._gridRepository = new InMemoryGridRepository();
    
    // ユースケースの初期化
    this._gridUseCase = new GridUseCase(this._gridRepository);
  }

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator._instance) {
      ServiceLocator._instance = new ServiceLocator();
    }
    return ServiceLocator._instance;
  }

  public get gridRepository(): IGridRepository {
    return this._gridRepository;
  }

  public get gridUseCase(): GridUseCase {
    return this._gridUseCase;
  }

  /**
   * テスト用：インスタンスをリセット
   */
  public static reset(): void {
    ServiceLocator._instance = new ServiceLocator();
  }
}
