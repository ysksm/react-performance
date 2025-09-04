import { IGridRepository } from '../../domain/repositories/IGridRepository.js';
import { GridRoot } from '../../domain/entities/GridRoot.js';
import { GridId } from '../../domain/valueObjects/GridId.js';
import { Position } from '../../domain/valueObjects/Position.js';
import { CellState } from '../../domain/valueObjects/CellState.js';

/**
 * グリッド操作のユースケース
 */
export class GridUseCase {
  constructor(private readonly _gridRepository: IGridRepository) {}

  /**
   * 新しいグリッドを作成
   */
  async createGrid(): Promise<GridRoot> {
    const grid = GridRoot.create();
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * グリッドを取得
   */
  async getGrid(id: GridId): Promise<GridRoot | null> {
    return await this._gridRepository.findById(id);
  }

  /**
   * 全グリッドを取得
   */
  async getAllGrids(): Promise<GridRoot[]> {
    return await this._gridRepository.findAll();
  }

  /**
   * 単一セルの状態を更新
   */
  async updateCellState(gridId: GridId, position: Position, state: CellState): Promise<GridRoot | null> {
    const grid = await this._gridRepository.findById(gridId);
    if (!grid) {
      return null;
    }

    grid.setCellState(position, state);
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * 行の全セル状態を一括更新
   */
  async updateRowState(gridId: GridId, row: number, state: CellState): Promise<GridRoot | null> {
    const grid = await this._gridRepository.findById(gridId);
    if (!grid) {
      return null;
    }

    grid.setRowState(row, state);
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * 列の全セル状態を一括更新
   */
  async updateColumnState(gridId: GridId, column: number, state: CellState): Promise<GridRoot | null> {
    const grid = await this._gridRepository.findById(gridId);
    if (!grid) {
      return null;
    }

    grid.setColumnState(column, state);
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * 全セル状態を一括更新
   */
  async updateAllCellsState(gridId: GridId, state: CellState): Promise<GridRoot | null> {
    const grid = await this._gridRepository.findById(gridId);
    if (!grid) {
      return null;
    }

    grid.setAllCellsState(state);
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * グリッドをリセット
   */
  async resetGrid(gridId: GridId): Promise<GridRoot | null> {
    const grid = await this._gridRepository.findById(gridId);
    if (!grid) {
      return null;
    }

    grid.reset();
    await this._gridRepository.save(grid);
    return grid;
  }

  /**
   * グリッドを削除
   */
  async deleteGrid(gridId: GridId): Promise<boolean> {
    return await this._gridRepository.delete(gridId);
  }

  /**
   * 全グリッドを削除
   */
  async deleteAllGrids(): Promise<void> {
    await this._gridRepository.deleteAll();
  }
}
