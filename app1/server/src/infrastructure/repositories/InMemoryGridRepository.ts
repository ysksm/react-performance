import { IGridRepository } from '../../domain/repositories/IGridRepository.js';
import { GridRoot } from '../../domain/entities/GridRoot.js';
import { GridId } from '../../domain/valueObjects/GridId.js';

/**
 * インメモリGridRepositoryの実装
 * 開発・テスト環境での使用を想定
 */
export class InMemoryGridRepository implements IGridRepository {
  private readonly _grids: Map<string, GridRoot> = new Map();

  async save(grid: GridRoot): Promise<void> {
    this._grids.set(grid.id.value, grid);
  }

  async findById(id: GridId): Promise<GridRoot | null> {
    return this._grids.get(id.value) || null;
  }

  async findAll(): Promise<GridRoot[]> {
    return Array.from(this._grids.values());
  }

  async delete(id: GridId): Promise<boolean> {
    return this._grids.delete(id.value);
  }

  async deleteAll(): Promise<void> {
    this._grids.clear();
  }

  async exists(id: GridId): Promise<boolean> {
    return this._grids.has(id.value);
  }

  /**
   * デバッグ用：現在のグリッド数を取得
   */
  public size(): number {
    return this._grids.size;
  }

  /**
   * デバッグ用：すべてのグリッドIDを取得
   */
  public getAllIds(): string[] {
    return Array.from(this._grids.keys());
  }
}
