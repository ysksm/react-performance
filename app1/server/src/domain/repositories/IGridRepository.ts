import { GridRoot } from '../entities/GridRoot.js';
import { GridId } from '../valueObjects/GridId.js';

/**
 * GridRepositoryインターフェース
 * 依存性逆転原則に従ってドメイン層にリポジトリのインターフェースを定義
 */
export interface IGridRepository {
  /**
   * グリッドを保存
   */
  save(grid: GridRoot): Promise<void>;

  /**
   * グリッドIDでグリッドを取得
   */
  findById(id: GridId): Promise<GridRoot | null>;

  /**
   * 全グリッドを取得
   */
  findAll(): Promise<GridRoot[]>;

  /**
   * グリッドを削除
   */
  delete(id: GridId): Promise<boolean>;

  /**
   * 全グリッドを削除
   */
  deleteAll(): Promise<void>;

  /**
   * グリッドの存在確認
   */
  exists(id: GridId): Promise<boolean>;
}
